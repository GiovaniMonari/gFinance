import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Smartphone,
} from 'lucide-react'
import { api } from '../api'
import {
  ECONVA_LOGIN_DEEP_LINK,
  ECONVA_LOGIN_REDIRECT_DELAY_MS,
} from '../config/mobileApp'
import './ResetPassword.css'

const EXPIRED_LINK_MESSAGE =
  'This password reset link is invalid or has expired. Please request a new one.'
const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.'
const NETWORK_ERROR_MESSAGE =
  "We couldn't connect to the server. Please check your connection and try again."

type FieldErrors = {
  newPassword?: string
  confirmPassword?: string
}

function getTokenFromUrl(): string {
  if (typeof window === 'undefined') return ''
  const params = new URLSearchParams(window.location.search)
  return (params.get('token') ?? '').trim()
}

function toFriendlyErrorMessage(raw: unknown): string {
  const message = raw instanceof Error ? raw.message : String(raw ?? '')
  const normalized = message.toLowerCase()

  if (
    normalized.includes('token inválido ou expirado') ||
    normalized.includes('token invalido ou expirado') ||
    (normalized.includes('token') &&
      (normalized.includes('invalid') ||
        normalized.includes('expired') ||
        normalized.includes('expirado') ||
        normalized.includes('inválido') ||
        normalized.includes('invalido')))
  ) {
    return EXPIRED_LINK_MESSAGE
  }

  if (
    normalized.includes('senhas não coincidem') ||
    normalized.includes('senhas nao coincidem') ||
    normalized.includes('passwords do not match') ||
    normalized.includes('passwords must match')
  ) {
    return 'Passwords do not match.'
  }

  if (
    normalized.includes('pelo menos 6') ||
    normalized.includes('at least 6') ||
    normalized.includes('minlength')
  ) {
    return 'Password must be at least 6 characters.'
  }

  if (
    normalized.includes('failed to fetch') ||
    normalized.includes('networkerror') ||
    normalized.includes('network error') ||
    normalized.includes('load failed')
  ) {
    return NETWORK_ERROR_MESSAGE
  }

  return GENERIC_ERROR_MESSAGE
}

function ResetPassword() {
  const token = useMemo(() => getTokenFromUrl(), [])

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const redirectTimer = useRef<number | null>(null)

  const missingToken = token.length === 0

  /**
   * Hand the flow back to the native app once the password has changed.
   * This only opens the app at its login screen — it does not authenticate
   * the user. When the app is not installed the deep link is a no-op and
   * the page stays put, leaving the manual "Open Econva" button as
   * the fallback.
   */
  useEffect(() => {
    if (!isSuccess) return
    redirectTimer.current = window.setTimeout(() => {
      window.location.href = ECONVA_LOGIN_DEEP_LINK
    }, ECONVA_LOGIN_REDIRECT_DELAY_MS)
    return () => {
      if (redirectTimer.current !== null) {
        window.clearTimeout(redirectTimer.current)
        redirectTimer.current = null
      }
    }
  }, [isSuccess])

  function validate(): FieldErrors {
    const errors: FieldErrors = {}

    if (!newPassword) {
      errors.newPassword = 'Password is required.'
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters.'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.'
    } else if (newPassword && confirmPassword !== newPassword) {
      errors.confirmPassword = 'Passwords do not match.'
    }

    return errors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting || isSuccess) return

    if (missingToken) {
      setFieldErrors({})
      setFormError(EXPIRED_LINK_MESSAGE)
      return
    }

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setFormError(null)
    setIsSubmitting(true)

    try {
      await api.resetPassword({
        token,
        newPassword,
        confirmPassword,
      })
      setIsSuccess(true)
    } catch (error) {
      setFormError(toFriendlyErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="reset-page">
      <header className="reset-topbar">
        <div className="container reset-topbar-content">
          <a href="/" className="logo" aria-label="Econva home">
            <img className="logo-mark" src="/logo-mark.png" alt="" />
            <span>Econva</span>
          </a>
        </div>
      </header>

      <main className="container reset-main">
        <div className="reset-card">
          {isSuccess ? (
            <section
              className="reset-success"
              aria-live="polite"
              aria-label="Password reset successfully"
            >
              <span className="reset-icon-badge reset-icon-badge-success">
                <CheckCircle2 size={26} aria-hidden="true" />
              </span>

              <h1>Password reset successfully</h1>

              <p>
                Your password has been changed. You can now sign in with
                your new password in the Econva app.
              </p>

              <a
                className="primary-button reset-submit"
                href={ECONVA_LOGIN_DEEP_LINK}
              >
                <Smartphone size={18} aria-hidden="true" />
                Open Econva
              </a>

              <p className="reset-redirect-hint">
                Opening the Econva app to the login screen. If it does not
                open automatically, tap the button above.
              </p>
            </section>
          ) : (
            <>
              <span className="reset-icon-badge" aria-hidden="true">
                <Lock size={22} />
              </span>

              <h1>Reset your password</h1>

              <p className="reset-supporting">
                Create a new password for your Econva account. After saving,
                use it the next time you sign in.
              </p>

              {missingToken ? (
                <div className="reset-alert" role="alert">
                  <AlertCircle size={17} aria-hidden="true" />
                  <span>{EXPIRED_LINK_MESSAGE}</span>
                </div>
              ) : null}

              {formError && !missingToken ? (
                <div className="reset-alert" role="alert">
                  <AlertCircle size={17} aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} noValidate>
                <div className="reset-field">
                  <label htmlFor="reset-new-password">New password</label>
                  <div
                    className={`reset-input-wrap${fieldErrors.newPassword ? ' reset-input-wrap-error' : ''}`}
                  >
                    <input
                      id="reset-new-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Enter your new password"
                      value={newPassword}
                      disabled={isSubmitting || missingToken}
                      aria-invalid={Boolean(fieldErrors.newPassword)}
                      aria-describedby={
                        fieldErrors.newPassword
                          ? 'reset-new-password-error'
                          : undefined
                      }
                      onChange={(event) => {
                        setNewPassword(event.target.value)
                        setFieldErrors((prev) => ({
                          ...prev,
                          newPassword: undefined,
                        }))
                      }}
                    />
                    <button
                      type="button"
                      className="reset-visibility-toggle"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      aria-pressed={showPassword}
                      disabled={isSubmitting || missingToken}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                      ) : (
                        <Eye size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.newPassword ? (
                    <span
                      id="reset-new-password-error"
                      className="reset-field-error"
                      role="alert"
                    >
                      {fieldErrors.newPassword}
                    </span>
                  ) : null}
                </div>

                <div className="reset-field">
                  <label htmlFor="reset-confirm-password">
                    Confirm new password
                  </label>
                  <div
                    className={`reset-input-wrap${fieldErrors.confirmPassword ? ' reset-input-wrap-error' : ''}`}
                  >
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      disabled={isSubmitting || missingToken}
                      aria-invalid={Boolean(fieldErrors.confirmPassword)}
                      aria-describedby={
                        fieldErrors.confirmPassword
                          ? 'reset-confirm-password-error'
                          : undefined
                      }
                      onChange={(event) => {
                        setConfirmPassword(event.target.value)
                        setFieldErrors((prev) => ({
                          ...prev,
                          confirmPassword: undefined,
                        }))
                      }}
                    />
                    <button
                      type="button"
                      className="reset-visibility-toggle"
                      aria-label={
                        showConfirmPassword
                          ? 'Hide confirmation password'
                          : 'Show confirmation password'
                      }
                      aria-pressed={showConfirmPassword}
                      disabled={isSubmitting || missingToken}
                      onClick={() => setShowConfirmPassword((value) => !value)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                      ) : (
                        <Eye size={18} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword ? (
                    <span
                      id="reset-confirm-password-error"
                      className="reset-field-error"
                      role="alert"
                    >
                      {fieldErrors.confirmPassword}
                    </span>
                  ) : null}
                </div>

                <button
                  type="submit"
                  className="primary-button reset-submit"
                  disabled={isSubmitting || missingToken}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        size={18}
                        className="reset-spinner"
                        aria-hidden="true"
                      />
                      Resetting password…
                    </>
                  ) : (
                    'Reset password'
                  )}
                </button>
              </form>

              <a
                className="reset-back-link"
                href={ECONVA_LOGIN_DEEP_LINK}
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Back to login
              </a>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default ResetPassword
