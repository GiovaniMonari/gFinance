import {
  OPEN_FINANCE_TEST_ACCOUNTS,
  canConnect,
  isOpenFinanceReleased,
  isOpenFinanceTestAccount,
} from './open-finance-access';

/**
 * The whole restriction is this predicate plus one exempt list, so this is
 * where the behaviour described in the brief is pinned: a new account is
 * blocked, an existing link is untouched, and one address keeps full access.
 */
describe('Open Finance access policy', () => {
  beforeEach(() => {
    delete process.env.OPEN_FINANCE_RELEASED;
  });

  afterAll(() => {
    delete process.env.OPEN_FINANCE_RELEASED;
  });

  it('is closed by default — an unset switch means restricted', () => {
    expect(isOpenFinanceReleased()).toBe(false);
  });

  it('opens only when the switch is explicitly set', () => {
    process.env.OPEN_FINANCE_RELEASED = 'true';
    expect(isOpenFinanceReleased()).toBe(true);

    process.env.OPEN_FINANCE_RELEASED = 'false';
    expect(isOpenFinanceReleased()).toBe(false);
  });

  it('blocks a brand-new account while the feature is closed', () => {
    expect(canConnect({ email: 'novo@email.com', hasConnection: false })).toBe(
      false,
    );
  });

  it('leaves an account that already has a link working', () => {
    expect(canConnect({ email: 'antiga@email.com', hasConnection: true })).toBe(
      true,
    );
  });

  it('keeps the test account on Open Finance whatever its link says', () => {
    expect(
      canConnect({ email: 'gimareeli@gmail.com', hasConnection: false }),
    ).toBe(true);
    expect(
      canConnect({ email: 'gimareeli@gmail.com', hasConnection: true }),
    ).toBe(true);
  });

  it('matches the test address despite case or padding', () => {
    expect(
      canConnect({
        email: '  GIMAREELI@Gmail.COM ',
        hasConnection: false,
      }),
    ).toBe(true);
  });

  it('grants nobody else that access', () => {
    expect(isOpenFinanceTestAccount('gimareeli@gmail.com.br')).toBe(false);
    expect(isOpenFinanceTestAccount('outro@gmail.com')).toBe(false);
    expect(isOpenFinanceTestAccount(null)).toBe(false);
    expect(isOpenFinanceTestAccount('')).toBe(false);
  });

  it('opens the flow to everyone once the switch is set', () => {
    process.env.OPEN_FINANCE_RELEASED = 'true';

    expect(
      canConnect({ email: 'qualquer@email.com', hasConnection: false }),
    ).toBe(true);
  });

  it('carries the exemption in this file only', () => {
    expect(OPEN_FINANCE_TEST_ACCOUNTS).toContain('gimareeli@gmail.com');
  });
});
