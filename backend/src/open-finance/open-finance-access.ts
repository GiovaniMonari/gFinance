/**
 * Open Finance — who may start a connection right now.
 *
 * The feature is closed for new connections while it finishes being released.
 * Everything that decides who is affected lives in this file and nowhere
 * else: the release switch, the addresses that are exempt, and the single
 * predicate both the guard and the status endpoint ask. No screen, no service
 * and no other module names an address, so the restriction cannot drift — and
 * lifting it is a decision taken here rather than a hunt through the app.
 */

/**
 * The release switch.
 *
 * Read from the environment rather than hard-coded, because this is a
 * temporary hold: opening it should take a configuration value and a restart,
 * not a change to source and a release. **Absent means restricted** — the safe
 * default, so the restriction cannot be lifted by forgetting to set anything,
 * only by deciding to.
 *
 * `OPEN_FINANCE_RELEASED=true` opens the flow to everyone; `canConnect` then
 * answers `true` before it looks at anything, which makes the guard wired
 * below a no-op. Removing the mechanism afterwards is deleting the guard
 * decorators, the status route, and this module.
 */
export function isOpenFinanceReleased(): boolean {
  return process.env.OPEN_FINANCE_RELEASED === 'true';
}

/**
 * Accounts that keep full access while the feature is closed.
 *
 * Normalised to lower case on read, so the address cannot silently stop
 * matching because of casing. This array is the only place in the product
 * where an address grants a capability.
 */
export const OPEN_FINANCE_TEST_ACCOUNTS: readonly string[] = [
  'gimareeli@gmail.com',
];

export type OpenFinanceAccess = {
  /** The signed-in user's email, or `null` when it could not be read. */
  email: string | null;
  /** Whether the user still holds an Open Finance link. */
  hasConnection: boolean;
};

/** Whether this account is on the exempt list. */
export function isOpenFinanceTestAccount(
  email: string | null | undefined,
): boolean {
  if (!email) return false;

  const normalised = email.trim().toLowerCase();

  return OPEN_FINANCE_TEST_ACCOUNTS.some(
    (candidate) => candidate.toLowerCase() === normalised,
  );
}

/**
 * The one decision, in one place.
 *
 * Order matters: the switch is answered before anything else, an exempt
 * account before the connection lookup, and an existing link before the
 * restriction — so every group in the intended behaviour is decided by the
 * clause that names it.
 */
export function canConnect({
  email,
  hasConnection,
}: OpenFinanceAccess): boolean {
  if (isOpenFinanceReleased()) return true;
  if (isOpenFinanceTestAccount(email)) return true;

  return hasConnection;
}
