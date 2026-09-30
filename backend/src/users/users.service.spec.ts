import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

/**
 * The profile endpoint reads one person's row. What matters is which columns
 * it asks for and whose id it looks up — the payload is two fields wide and
 * the lookup key can only be the one it was handed by the guard.
 */
describe('UsersService', () => {
  let findUnique: jest.Mock;
  let service: UsersService;

  beforeEach(() => {
    findUnique = jest.fn();
    service = new UsersService({ user: { findUnique } } as never);
  });

  it('answers with the id and the email only', async () => {
    findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'ana@email.com',
    });

    await expect(service.getProfile('user-1')).resolves.toEqual({
      id: 'user-1',
      email: 'ana@email.com',
    });
  });

  it('asks for two columns and never for the password', async () => {
    findUnique.mockResolvedValue({ id: 'user-1', email: 'ana@email.com' });

    await service.getProfile('user-1');

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { id: true, email: true },
    });
  });

  it('reports a user that no longer exists as 404, not as a null body', async () => {
    findUnique.mockResolvedValue(null);

    await expect(service.getProfile('user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
