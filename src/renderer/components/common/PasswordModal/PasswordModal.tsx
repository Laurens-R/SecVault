import { useState, useEffect, useRef, type FormEvent } from 'react'
import styles from './PasswordModal.module.scss'

interface PasswordModalProps {
  mode: 'create' | 'open'
  vaultName: string
  isLoading: boolean
  error: string | null
  onSubmit: (password: string) => void
  onCancel: () => void
}

function PasswordModal({ mode, vaultName, isLoading, error, onSubmit, onCancel }: PasswordModalProps): JSX.Element {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  // Clear local validation error when external error arrives
  useEffect(() => {
    if (error) setLocalError(null)
  }, [error])

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault()
    setLocalError(null)

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.')
      return
    }
    if (mode === 'create' && password !== confirm) {
      setLocalError('Passwords do not match.')
      return
    }

    onSubmit(password)

    // Clear sensitive state immediately after submitting
    setPassword('')
    setConfirm('')
  }

  const displayError = error ?? localError

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sv-modal-title"
    >
      <div className={styles.modal}>
        <h2 id="sv-modal-title" className={styles.title}>
          {mode === 'create' ? 'Create Vault Password' : 'Unlock Vault'}
        </h2>

        <p className={styles.vaultName}>{vaultName}</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="sv-password" className={styles.label}>
              {mode === 'create' ? 'Master Password' : 'Password'}
            </label>
            <input
              ref={inputRef}
              id="sv-password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setLocalError(null) }}
              autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
              disabled={isLoading}
              required
            />
          </div>

          {mode === 'create' && (
            <div className={styles.field}>
              <label htmlFor="sv-confirm" className={styles.label}>Confirm Password</label>
              <input
                id="sv-confirm"
                type="password"
                className={styles.input}
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setLocalError(null) }}
                autoComplete="new-password"
                disabled={isLoading}
                required
              />
            </div>
          )}

          {displayError && (
            <p className={styles.error} role="alert">{displayError}</p>
          )}

          {mode === 'create' && (
            <p className={styles.hint}>
              Your vault is encrypted with AES-256-GCM. This password cannot be recovered if lost.
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Working…' : mode === 'create' ? 'Create Vault' : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PasswordModal
