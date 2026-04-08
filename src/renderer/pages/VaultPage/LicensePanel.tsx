import { useState, useCallback, useMemo, useEffect, useRef, type FormEvent } from 'react'
import type { SoftwareLicense, SubVaultItem } from '../../models'
import { randomUUID } from '../../utils/uuid'
import styles from './LicensePanel.module.scss'

interface LicensePanelProps {
  licenses: SoftwareLicense[]
  onAdd: (item: SubVaultItem) => void
  onUpdate: (item: SubVaultItem & { id: string }) => void
  onDelete: (id: string) => void
}

// ── LicensePanel ──────────────────────────────────────────────────────────────
function LicensePanel({ licenses, onAdd, onUpdate, onDelete }: LicensePanelProps): JSX.Element {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [isNew, setIsNew] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return licenses
    return licenses.filter(l =>
      l.productName.toLowerCase().includes(q) ||
      (l.registeredTo ?? '').toLowerCase().includes(q) ||
      (l.email ?? '').toLowerCase().includes(q),
    )
  }, [licenses, search])

  const selected = filtered.find(l => l.id === selectedId) ?? null

  const handleAddNew = useCallback(() => { setSelectedId(null); setIsNew(true) }, [])
  const handleSelect = useCallback((id: string) => { setIsNew(false); setSelectedId(id) }, [])

  const handleSave = useCallback((license: SoftwareLicense) => {
    if (isNew) onAdd(license); else onUpdate(license)
    setIsNew(false)
    setSelectedId(license.id)
  }, [isNew, onAdd, onUpdate])

  const handleDelete = useCallback((id: string) => {
    onDelete(id)
    setIsNew(false)
    setSelectedId(null)
  }, [onDelete])

  const handleCancel = useCallback(() => { setIsNew(false); setSelectedId(null) }, [])

  return (
    <>
      <LicenseList
        licenses={filtered}
        selectedId={selectedId}
        search={search}
        onSearchChange={setSearch}
        onSelect={handleSelect}
        onAddNew={handleAddNew}
      />
      <LicenseDetail
        license={selected}
        isNew={isNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={handleCancel}
      />
    </>
  )
}

// ── LicenseList ───────────────────────────────────────────────────────────────
interface LicenseListProps {
  licenses: SoftwareLicense[]
  selectedId: string | null
  search: string
  onSearchChange: (q: string) => void
  onSelect: (id: string) => void
  onAddNew: () => void
}

function LicenseList({ licenses, selectedId, search, onSearchChange, onSelect, onAddNew }: LicenseListProps): JSX.Element {
  return (
    <div className={styles.listPanel}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <SearchIcon />
          <input
            className={styles.search}
            type="search"
            placeholder="Search licenses…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            aria-label="Search licenses"
          />
        </div>
        <button className={styles.addBtn} onClick={onAddNew} title="New license" aria-label="New license">
          <PlusIcon />
        </button>
      </div>

      <ul className={styles.list} role="listbox" aria-label="Licenses">
        {licenses.length === 0 ? (
          <li className={styles.empty}>{search ? 'No results' : 'No licenses yet'}</li>
        ) : (
          licenses.map(l => (
            <li
              key={l.id}
              className={`${styles.item} ${l.id === selectedId ? styles.active : ''}`}
              role="option"
              aria-selected={l.id === selectedId}
            >
              <button className={styles.itemBtn} onClick={() => onSelect(l.id)}>
                <span className={styles.iconWrap}><LicenseIcon /></span>
                <span className={styles.info}>
                  <span className={styles.label}>{l.productName}</span>
                  <span className={styles.sub}>{l.registeredTo ?? l.email ?? maskKey(l.licenseKey)}</span>
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

function maskKey(key: string): string {
  if (key.length <= 8) return '••••••••'
  return key.slice(0, 4) + '••••••••' + key.slice(-4)
}

// ── LicenseDetail ─────────────────────────────────────────────────────────────
interface LicenseDetailProps {
  license: SoftwareLicense | null
  isNew: boolean
  onSave: (license: SoftwareLicense) => void
  onDelete: (id: string) => void
  onCancel: () => void
}

const EMPTY = { productName: '', licenseKey: '', registeredTo: '', email: '', purchaseDate: '', expiresAt: '', notes: '' }

function LicenseDetail({ license, isNew, onSave, onDelete, onCancel }: LicenseDetailProps): JSX.Element {
  const [form, setForm] = useState({ ...EMPTY })
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setForm({
      productName: license?.productName ?? '',
      licenseKey: license?.licenseKey ?? '',
      registeredTo: license?.registeredTo ?? '',
      email: license?.email ?? '',
      purchaseDate: license?.purchaseDate ?? '',
      expiresAt: license?.expiresAt ?? '',
      notes: license?.notes ?? '',
    })
    setError(null)
    setShowKey(false)
    setCopiedKey(false)
  }, [license?.id, isNew]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setError(null)
  }

  const copyKey = (): void => {
    if (!form.licenseKey) return
    navigator.clipboard.writeText(form.licenseKey).then(() => {
      setCopiedKey(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopiedKey(false), 2000)
    }).catch(() => { /* clipboard unavailable */ })
  }

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault()
    if (!form.productName.trim()) { setError('Product name is required.'); return }
    if (!form.licenseKey.trim()) { setError('License key is required.'); return }
    const now = new Date()
    onSave({
      id: license?.id ?? randomUUID(),
      productName: form.productName.trim(),
      licenseKey: form.licenseKey.trim(),
      registeredTo: form.registeredTo.trim() || undefined,
      email: form.email.trim() || undefined,
      purchaseDate: form.purchaseDate.trim() || undefined,
      expiresAt: form.expiresAt.trim() || undefined,
      notes: form.notes.trim() || undefined,
      createdAt: license?.createdAt ?? now,
      updatedAt: now,
    })
  }

  if (!license && !isNew) {
    return (
      <div className={styles.emptyDetail}>
        <LicenseEmptyIcon />
        <p>Select a license or add a new one</p>
      </div>
    )
  }

  return (
    <div className={styles.detail}>
      <div className={styles.detailHeader}>
        <h2 className={styles.detailTitle}>{isNew ? 'New License' : license?.productName}</h2>
        <div className={styles.detailActions}>
          {!isNew && license && (
            <button className={styles.deleteBtn} type="button" onClick={() => onDelete(license.id)} aria-label="Delete license">
              <TrashIcon /> Delete
            </button>
          )}
          <button className={styles.cancelBtn} type="button" onClick={onCancel}>Cancel</button>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <FormField label="Product Name" required>
          <input className={styles.input} value={form.productName} onChange={set('productName')} autoFocus={isNew} maxLength={256} />
        </FormField>

        <FormField label="License Key" required action={
          <div className={styles.keyActions}>
            <button type="button" className={styles.iconBtn} onClick={() => setShowKey(v => !v)} aria-label={showKey ? 'Hide key' : 'Show key'}>
              {showKey ? <EyeOffIcon /> : <EyeIcon />}
            </button>
            <button type="button" className={`${styles.iconBtn} ${copiedKey ? styles.copied : ''}`} onClick={copyKey} aria-label="Copy license key">
              {copiedKey ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        }>
          <input
            className={`${styles.input} ${styles.mono}`}
            type={showKey ? 'text' : 'password'}
            value={form.licenseKey}
            onChange={set('licenseKey')}
            placeholder={isNew ? '' : 'Leave blank to keep current'}
            autoComplete="off"
          />
        </FormField>

        <FormField label="Registered To">
          <input className={styles.input} value={form.registeredTo} onChange={set('registeredTo')} maxLength={256} />
        </FormField>

        <FormField label="Email">
          <input className={styles.input} type="email" value={form.email} onChange={set('email')} maxLength={256} />
        </FormField>

        <div className={styles.row}>
          <FormField label="Purchase Date">
            <input className={styles.input} type="date" value={form.purchaseDate} onChange={set('purchaseDate')} />
          </FormField>
          <FormField label="Expires">
            <input className={styles.input} type="date" value={form.expiresAt} onChange={set('expiresAt')} />
          </FormField>
        </div>

        <FormField label="Notes">
          <textarea className={`${styles.input} ${styles.textarea}`} value={form.notes} onChange={set('notes')} rows={3} maxLength={4096} />
        </FormField>

        {error && <p className={styles.error} role="alert">{error}</p>}
        <button className={styles.saveBtn} type="submit">{isNew ? 'Add License' : 'Save Changes'}</button>
      </form>
    </div>
  )
}

function FormField({ label, required, action, children }: { label: string; required?: boolean; action?: React.ReactNode; children: React.ReactNode }): JSX.Element {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.fieldLabel}>{label}{required && <span className={styles.required}>*</span>}</label>
        {action}
      </div>
      {children}
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const SearchIcon = (): JSX.Element => (
  <svg className="searchIcon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const PlusIcon = (): JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const LicenseIcon = (): JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
)
const LicenseEmptyIcon = (): JSX.Element => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
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
const CopyIcon = (): JSX.Element => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
)
const CheckIcon = (): JSX.Element => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default LicensePanel
