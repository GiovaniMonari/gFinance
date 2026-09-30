import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/*
 * `@nestjs/jwt` ships untranspiled ESM while the project's jest config only
 * transforms `src`; the controller pulls the service, which pulls it. Nothing
 * here signs anything, so the module is stubbed.
 */
jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {},
}));

const MESSAGE = 'Muitas tentativas. Aguarde alguns segundos e tente novamente.';

/**
 * The limits are the part of this fix that a caller can feel, so they are
 * checked by making the requests rather than by reading the configuration.
 *
 * Two things matter beyond the count itself: a rejected attempt answers 429
 * with a sentence in the same language as the rest of the API, and the budget
 * belongs to the account — otherwise every user behind one proxy address
 * would share a single allowance that a stranger could spend on their behalf.
 */
describe('the credential limit', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({
          throttlers: [{ name: 'default', ttl: 60_000, limit: 300 }],
          errorMessage: MESSAGE,
        }),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(() => ({ access_token: 'token' })),
            register: jest.fn(() => ({ access_token: 'token' })),
          },
        },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  /** 201 is what Nest answers a POST with when nothing asks for otherwise. */
  function post(path: string, email: string) {
    return request(app.getHttpServer() as Server)
      .post(path)
      .send({ email, password: 'senha123' });
  }

  /** The sentence a caller is shown once the limit has been passed. */
  function messageOf(response: { body: { message?: unknown } }): string {
    return String(response.body.message);
  }

  it('lets an account in ten times and answers the eleventh with 429', async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await post('/auth/login', 'joao@exemplo.com').expect(201);
    }

    const response = await post('/auth/login', 'joao@exemplo.com').expect(429);

    expect(messageOf(response)).toBe(MESSAGE);
  });

  it('spends one account’s budget, not another’s', async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await post('/auth/login', 'joao@exemplo.com').expect(201);
    }

    await post('/auth/login', 'joao@exemplo.com').expect(429);

    await post('/auth/login', 'maria@exemplo.com').expect(201);
  });

  it('counts creating an account too', async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await post('/auth/register', 'novo@exemplo.com').expect(201);
    }

    const response = await post('/auth/register', 'novo@exemplo.com').expect(
      429,
    );

    expect(messageOf(response)).toBe(MESSAGE);
  });

  it('leaves an address that has not been tried yet alone', async () => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await post('/auth/register', 'novo@exemplo.com').expect(201);
    }

    await post('/auth/register', 'novo@exemplo.com').expect(429);

    await post('/auth/register', 'outro@exemplo.com').expect(201);
  });
});
