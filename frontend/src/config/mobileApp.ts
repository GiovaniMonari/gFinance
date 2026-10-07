/**
 * Econva mobile app deep links.
 *
 * The password-reset flow ends in the native app:
 *
 *   Email → Web Reset Password Page → Password Successfully Changed
 *     → Econva Mobile App → Login Screen
 *
 * After the web page confirms the new password, the user is sent to the
 * mobile login screen and signs in there with the new password. The deep
 * link only opens the app at its login route — it never authenticates the
 * user, so no session, credential, or reset token is passed along with it.
 *
 * No custom scheme is registered on the mobile side yet (no `scheme` in the
 * Expo config, no `linking` config on the navigator, no deep-link
 * intent-filter on Android). Until the app adopts one, this module is the
 * single place that needs to agree with it: keep the value as
 * `econva://login`, and on the mobile side register the matching scheme:
 *
 *   Expo config:      { "expo": { "scheme": "econva", ... } }
 *   React Navigation: linking = { prefixes: ['econva://'],
 *                       config: { screens: { Login: 'login' } } }
 *   Android/iOS:      intent-filter / associated domains as needed.
 *
 * The backend password-reset API (`POST /auth/reset-password`) does not
 * change — the token stays in the web page and is never stored or logged.
 */

export const ECONVA_APP_SCHEME = 'econva'

export const ECONVA_LOGIN_SCREEN_PATH = 'login'

/** Deep link to the Econva mobile app login screen (`econva://login`). */
export const ECONVA_LOGIN_DEEP_LINK =
  `${ECONVA_APP_SCHEME}://${ECONVA_LOGIN_SCREEN_PATH}`

/**
 * Delay before the success screen attempts to hand off to the app.
 * The page stays put when the app is not installed, so the manual
 * "Open Econva" button remains available as the fallback.
 */
export const ECONVA_LOGIN_REDIRECT_DELAY_MS = 1500
