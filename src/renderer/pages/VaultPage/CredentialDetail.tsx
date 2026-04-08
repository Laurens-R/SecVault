import { useState, useEffect, type FormEvent } from 'react'
import type { Credential, NewCredential } from '../../../models'
import { randomUUID } from '../../utils/uuid'
import styles from './CredentialDetail.module.scss'

interface CredentialDetailProps {
  credential: Credential | null
  isNew: boolean
  onSave: (credential: Credential) => void
  onDelete: (id: string) => void
  onCancel: () => void
}

const EMPTY_FORM: Omit<NewCredential, 'encryptedPassword'> & { password: string } = {
  label: '',
  username: '',
  password: '',
  url: '',
  notes: '',
}

function CredentialDetail({ credential, isNew, onSave, onDelete, onCancel }: CredentialDetailProps): JSX.Element {
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (credential) {
      setForm({
        label: credential.label,
        username: credential.username,
        password: '',        // never pre-fill decrypted password
        url: credential.url ?? '',
        notes: credential.notes ?? '',
      })
    } else {
      setForm({ ...EMPTY_FORM })
    }
    setError(null)
    setShowPassword(false)
  }, [credential, isNew])

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setError(null)
  }

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault()
    if (!form.label.trim()) {
      setError('Name is required.')
      return
    }
    const now = new Date()
    const saved: Credential = {
      id: credential?.id ?? randomUUID(),
      label: form.label.trim(),
      username: form.username.trim(),
      encryptedPassword: form.password,  // TODO: encrypt before saving to disk
      url: form.url.trim() || undefined,
      notes: form.notes.trim() || undefined,
      createdAt: credential?.createdAt ?? now,
      updatedAt: now,
    }
    onSave(saved)
  }

  if (!credential && !isNew) {
    return (
      <div className={styles.empty}>
        <LockIcon />
        <p>Select a credential or create a new one</p>
      </div>
    )
  }

  return (
    <div className={styles.detail}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {isNew ? 'New Credential' : credential?.label}
        </h2>
        <div className={styles.headerActions}>
          {!isNew && credential && (
            <button
              className={styles.deleteBtn}
              type="button"
              onClick={() => onDelete(credential.id)}
              aria-label="Delete credential"
              title="Delete"
            >
              <TrashIcon />
              Delete
            </button>
          )}
          <button className={styles.cancelBtn} type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Field label="Name" required>
          <input className={styles.input} value={form.label} onChange={set('label')} autoFocus={isNew} maxLength={128} />
        </Field>

        <Field label="Username / Email">
          <input className={styles.input} value={form.username} onChange={set('username')} autoComplete="off" maxLength={256} />
        </Field>

        <Field label={isNew ? 'Password' : 'New Password'}>
          <div className={styles.passwordRow}>
            <input
              className={styles.input}
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              placeholder={isNew ? '' : 'Leave blank to keep current'}
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.revealBtn}
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </Field>

        <Field label="URL">
          <input className={styles.input} value={form.url} onChange={set('url')} type="url" placeholder="https://" maxLength={2048} />
        </Field>

        <Field label="Notes">
          <textarea className={`${styles.input} ${styles.textarea}`} value={form.notes} onChange={set('notes')} rows={4} maxLength={4096} />
        </Field>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <button className={styles.saveBtn} type="submit">
          {isNew ? 'Add Credential' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }): JSX.Element {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {label}{required && <span className={styles.required}>*</span>}
      </label>
      {children}
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const LockIcon = (): JSX.Element => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
)

const TrashIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
)

const EyeIcon = (): JSX.Element => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = (): JSX.Element => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

export default CredentialDetail
