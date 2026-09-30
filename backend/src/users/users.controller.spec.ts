/*
 * `@nestjs/passport` ships untranspiled ESM while the project's jest config
 * only transforms `src`, so requiring it dies before the suite starts. The
 * guard's own behaviour is Passport's, not what is under test here — this
 * suite only records which guard is attached — so the module is stubbed
 * rather than rewriting transform rules for the whole project.
 */
jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => class AuthGuardStub {},
}));

import {
  METHOD_METADATA,
  PATH_METADATA,
  GUARDS_METADATA,
} from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersController } from './users.controller';

/**
 * The whole point of `GET /users/me` is that the profile it returns belongs to
 * whoever holds the token. Two things carry that: the route is behind the JWT
 * guard, and the controller has no id parameter at all — the id it looks up is
 * the one the guard put on the request, so a caller has no slot in which to
 * name somebody else.
 */
describe('UsersController', () => {
  let getProfile: jest.Mock;
  let controller: UsersController;

  beforeEach(() => {
    getProfile = jest.fn();
    controller = new UsersController({ getProfile } as never);
  });

  /**
   * The decorators hang their metadata on the handler function itself, so the
   * handler is pulled off the prototype by name: reading it as a member
   * expression would be a method reference, which is not what is being asked.
   */
  function handler(): object {
    return Object.getOwnPropertyDescriptor(UsersController.prototype, 'getMe')
      ?.value as object;
  }

  it('rejects anyone without a valid token', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, handler())).toEqual([
      JwtAuthGuard,
    ]);
  });

  it('reads the id from the authenticated request', async () => {
    getProfile.mockResolvedValue({ id: 'user-1', email: 'ana@email.com' });

    await expect(
      controller.getMe({ user: { id: 'user-1' } } as never),
    ).resolves.toEqual({ id: 'user-1', email: 'ana@email.com' });

    expect(getProfile).toHaveBeenCalledWith('user-1');
  });

  it('is mounted as GET /users/me', () => {
    expect(Reflect.getMetadata(PATH_METADATA, UsersController)).toBe('users');
    expect(Reflect.getMetadata(PATH_METADATA, handler())).toBe('me');
    expect(Reflect.getMetadata(METHOD_METADATA, handler())).toBe(
      RequestMethod.GET,
    );
  });
});
