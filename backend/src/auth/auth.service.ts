import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

/**
 * One shape for an address, taken before anything is stored or looked up.
 *
 * Written addresses are already in this shape, so reading them back is what
 * the extra passes below are for: rows that predate the rule are still
 * reachable, and a person who capitalises their address differently still
 * signs in to their own account rather than being told it does not exist.
 */
function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Prisma reports every unique-index violation as `P2002`.
 *
 * Read off the code rather than off the error's class: the class identity is
 * tied to whichever copy of `@prisma/client` loaded, and this has to hold in
 * the service and in its tests alike.
 */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: unknown }).code === 'P2002'
  );
}

const EMAIL_TAKEN = 'Este e-mail já está cadastrado.';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  generateToken(userId: string) {
    const payload = {
      sub: userId,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Create an account.
   *
   * Two things make this more than a plain insert.
   *
   * The address is normalised before it is written, so `Joao@Exemplo.com` and
   * `joao@exemplo.com` cannot both exist as different people — and that is not
   * only an identity question: the Open Finance exemption is decided by
   * comparing addresses case-insensitively, so a second row differing only in
   * casing would inherit somebody else's privilege. The check below rejects it
   * outright instead of letting the comparison quietly agree with it.
   *
   * A collision that slips past that check — a race, or an address stored
   * before this rule — surfaces as `P2002` and is reported as the same 409
   * rather than escaping as a 500.
   */
  async register(email: string, password: string) {
    const stored = normaliseEmail(email);

    const existing = await this.prisma.user.findFirst({
      where: { email: { equals: stored, mode: 'insensitive' } },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(EMAIL_TAKEN);
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.prisma.user.create({
        data: {
          email: stored,
          password: hashedPassword,
        },
      });

      return this.generateToken(user.id);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(EMAIL_TAKEN);
      }

      throw error;
    }
  }

  /**
   * Sign in.
   *
   * The address exactly as typed is tried first, so a person who capitalises
   * it the way it is stored always lands on their own row — which matters when
   * two case-variants exist. Only when that finds nothing does the lookup fall
   * back to a case-insensitive match, so addresses written before normalisation
   * still work instead of becoming unreachable.
   *
   * Either way the password is compared against the row that was found; the
   * fallback widens who can be *matched*, never who can be *authenticated*.
   */
  async login(email: string, password: string) {
    const user =
      (await this.prisma.user.findUnique({
        where: {
          email,
        },
      })) ??
      (await this.prisma.user.findFirst({
        where: {
          email: { equals: normaliseEmail(email), mode: 'insensitive' },
        },
      }));

    if (!user) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    return this.generateToken(user.id);
  }
}
