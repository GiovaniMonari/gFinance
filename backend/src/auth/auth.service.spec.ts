import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { validate } from 'class-validator';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

/*
 * `@nestjs/jwt` ships untranspiled ESM while the project's jest config only
 * transforms `src`, so requiring it dies before the suite starts — the same
 * reason `@nestjs/axios` and `@nestjs/config` are stubbed in the open-finance
 * spec. Nothing here exercises signing; a fake takes its place below.
 */
jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {},
}));

/*
 * `bcrypt` is a native module; the real one only slows the suite down here,
 * and neither hash nor compare is what any of these tests is about.
 */
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

/**
 * The exemption for Open Finance is decided by comparing addresses
 * case-insensitively, so a second row differing only in casing would inherit
 * somebody else's privilege — and a person whose address was written before
 * normalisation would become unrecognisable to the lookup. Both come down to
 * what registration writes and what sign-in will still find, which is what
 * this covers.
 */
describe('AuthService', () => {
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
    };
  };
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();

    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    service = new AuthService(
      { sign: jest.fn(() => 'signed-token') } as never,
      prisma as never,
    );

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  describe('register', () => {
    it('writes the address in one shape, whatever was typed', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 'user-1' });

      await service.register('  Joao@Exemplo.COM  ', 'senha123');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: { equals: 'joao@exemplo.com', mode: 'insensitive' } },
        select: { id: true },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'joao@exemplo.com',
          password: 'hashed-password',
        },
      });
    });

    it('refuses an address that differs only by casing from one already taken', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 'somebody-else' });

      await expect(
        service.register('Gimareeli@Gmail.com', 'senha123'),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('reports an address taken in the same moment as 409, not as 500', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.register('novo@exemplo.com', 'senha123'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('leaves an unrelated failure alone', async () => {
      const failure = new Error('banco indisponível');

      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockRejectedValue(failure);

      await expect(
        service.register('novo@exemplo.com', 'senha123'),
      ).rejects.toBe(failure);
    });

    it('issues a token for the account it created', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: 'user-1' });

      await expect(
        service.register('novo@exemplo.com', 'senha123'),
      ).resolves.toEqual({ access_token: 'signed-token' });
    });
  });

  describe('login', () => {
    it('tries the address exactly as typed, so two case-variants are told apart', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        password: 'hashed-password',
      });

      await expect(
        service.login('Joao@Exemplo.com', 'senha123'),
      ).resolves.toEqual({ access_token: 'signed-token' });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'Joao@Exemplo.com' },
      });
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('still finds an address written before normalisation', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.findFirst.mockResolvedValue({
        id: 'legacy-user',
        password: 'hashed-password',
      });

      await expect(
        service.login('Joao@Exemplo.com', 'senha123'),
      ).resolves.toEqual({ access_token: 'signed-token' });

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: { equals: 'joao@exemplo.com', mode: 'insensitive' } },
      });
    });

    it('rejects a password that does not match, whichever lookup found them', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        password: 'hashed-password',
      });

      await expect(
        service.login('joao@exemplo.com', 'senhaerrada'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an address nobody has', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login('ninguem@exemplo.com', 'senha123'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  /**
   * The rule applies where an account is created and deliberately nowhere
   * else: applying it to sign-in as well would lock out anybody whose
   * password predates it, from a form they are only trying to sign in with.
   */
  describe('the password rule', () => {
    async function rejectedPassword(dto: LoginDto | RegisterDto) {
      const errors = await validate(dto);

      return errors.some((error) => error.property === 'password');
    }

    it('turns away a password too short to create an account with', async () => {
      const dto = new RegisterDto();
      dto.email = 'novo@exemplo.com';
      dto.password = '12345';

      await expect(rejectedPassword(dto)).resolves.toBe(true);
    });

    it('accepts the shortest password the app itself offers', async () => {
      const dto = new RegisterDto();
      dto.email = 'novo@exemplo.com';
      dto.password = '123456';

      await expect(rejectedPassword(dto)).resolves.toBe(false);
    });

    it('does not apply it to somebody signing in', async () => {
      const dto = new LoginDto();
      dto.email = 'joao@exemplo.com';
      dto.password = '12345';

      await expect(rejectedPassword(dto)).resolves.toBe(false);
    });
  });
});
