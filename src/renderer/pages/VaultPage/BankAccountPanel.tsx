import { useState, useCallback, useMemo, useEffect, useRef, type FormEvent } from 'react'
import type { BankAccount, BankAccountType, SubVaultItem } from '../../models'
import { randomUUID } from '../../utils/uuid'
import styles from './BankAccountPanel.module.scss'

interface BankAccountPanelProps {
  accounts: BankAccount[]
  onAdd: (item: SubVaultItem) => void
  onUpdate: (item: SubVaultItem & { id: string }) => void
  onDelete: (id: string) => void
}

// ── BankAccountPanel ──────────────────────────────────────────────────────────
function BankAccountPanel({ accounts, onAdd, onUpdate, onDelete }: BankAccountPanelProps): JSX.Element {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [isNew, setIsNew] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return accounts
    return accounts.filter(a =>
      a.label.toLowerCase().includes(q) ||
      (a.bankName ?? '').toLowerCase().includes(q),
    )
  }, [accounts, search])

  const selected = filtered.find(a => a.id === selectedId) ?? null

  const handleAddNew = useCallback(() => { setSelectedId(null); setIsNew(true) }, [])
  const handleSelect = useCallback((id: string) => { setIsNew(false); setSelectedId(id) }, [])

  const handleSave = useCallback((account: BankAccount) => {
    if (isNew) onAdd(account); else onUpdate(account)
    setIsNew(false)
    setSelectedId(account.id)
  }, [isNew, onAdd, onUpdate])

  const handleDelete = useCallback((id: string) => {
    onDelete(id)
    setIsNew(false)
    setSelectedId(null)
  }, [onDelete])

  const handleCancel = useCallback(() => { setIsNew(false); setSelectedId(null) }, [])

  return (
    <>
      <BankAccountList
        accounts={filtered}
        selectedId={selectedId}
        search={search}
        onSearchChange={setSearch}
        onSelect={handleSelect}
        onAddNew={handleAddNew}
      />
      <BankAccountDetail
        account={selected}
        isNew={isNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={handleCancel}
      />
    </>
  )
}

// ── BankAccountList ───────────────────────────────────────────────────────────
interface BankAccountListProps {
  accounts: BankAccount[]
  selectedId: string | null
  search: string
  onSearchChange: (q: string) => void
  onSelect: (id: string) => void
  onAddNew: () => void
}

function BankAccountList({ accounts, selectedId, search, onSearchChange, onSelect, onAddNew }: BankAccountListProps): JSX.Element {
  return (
    <div className={styles.listPanel}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <SearchIcon />
          <input
            className={styles.search}
            type="search"
            placeholder="Search accounts…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            aria-label="Search accounts"
          />
        </div>
        <button className={styles.addBtn} onClick={onAddNew} title="New account" aria-label="New account">
          <PlusIcon />
        </button>
      </div>

      <ul className={styles.list} role="listbox" aria-label="Bank accounts">
        {accounts.length === 0 ? (
          <li className={styles.empty}>{search ? 'No results' : 'No accounts yet'}</li>
        ) : (
          accounts.map(a => (
            <li
              key={a.id}
              className={`${styles.item} ${a.id === selectedId ? styles.active : ''}`}
              role="option"
              aria-selected={a.id === selectedId}
            >
              <button className={styles.itemBtn} onClick={() => onSelect(a.id)}>
                <span className={styles.iconWrap}>
                  {a.accountType === 'credit-card' ? <CreditCardIcon /> : <BankIcon />}
                </span>
                <span className={styles.info}>
                  <span className={styles.label}>{a.label}</span>
                  <span className={styles.sub}>
                    <span className={`${styles.typeBadge} ${a.accountType === 'credit-card' ? styles.badgeCard : styles.badgeBank}`}>
                      {a.accountType === 'credit-card' ? 'Credit Card' : 'Bank Account'}
                    </span>
                    {a.bankName && <span> · {a.bankName}</span>}
                  </span>
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

// ── BankAccountDetail ─────────────────────────────────────────────────────────
interface BankAccountDetailProps {
  account: BankAccount | null
  isNew: boolean
  onSave: (account: BankAccount) => void
  onDelete: (id: string) => void
  onCancel: () => void
}

const EMPTY_BANK = { label: '', bankName: '', accountNumber: '', routingNumber: '', pin: '', notes: '' }
const EMPTY_CARD = { label: '', bankName: '', cardNumber: '', expiryDate: '', cvv: '', pin: '', notes: '' }

function BankAccountDetail({ account, isNew, onSave, onDelete, onCancel }: BankAccountDetailProps): JSX.Element {
  const [accountType, setAccountType] = useState<BankAccountType>('bank')
  const [form, setForm] = useState<Record<string, string>>({ ...EMPTY_BANK })
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const type = account?.accountType ?? 'bank'
    setAccountType(type)
    setForm(type === 'credit-card' ? {
      label: account?.label ?? '',
      bankName: account?.bankName ?? '',
      cardNumber: account?.cardNumber ?? '',
      expiryDate: account?.expiryDate ?? '',
      cvv: account?.cvv ?? '',
      pin: account?.pin ?? '',
      notes: account?.notes ?? '',
    } : {
      label: account?.label ?? '',
      bankName: account?.bankName ?? '',
      accountNumber: account?.accountNumber ?? '',
      routingNumber: account?.routingNumber ?? '',
      pin: account?.pin ?? '',
      notes: account?.notes ?? '',
    })
    setError(null)
    setShowSensitive({})
    setCopiedField(null)
  }, [account?.id, isNew]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setError(null)
  }

  const copyField = (key: string, value: string): void => {
    if (!value) return
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(key)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopiedField(null), 2000)
    }).catch(() => { /* clipboard unavailable */ })
  }

  const toggleShow = (key: string): void => setShowSensitive(prev => ({ ...prev, [key]: !prev[key] }))

  const handleTypeChange = (t: BankAccountType): void => {
    setAccountType(t)
    setForm(t === 'credit-card' ? { ...EMPTY_CARD, label: form.label, bankName: form.bankName, notes: form.notes } : { ...EMPTY_BANK, label: form.label, bankName: form.bankName, notes: form.notes })
  }

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault()
    if (!form.label?.trim()) { setError('Label is required.'); return }
    const now = new Date()
    onSave({
      id: account?.id ?? randomUUID(),
      accountType,
      label: form.label.trim(),
      bankName: form.bankName?.trim() || undefined,
      accountNumber: form.accountNumber?.trim() || undefined,
      routingNumber: form.routingNumber?.trim() || undefined,
      cardNumber: form.cardNumber?.trim() || undefined,
      expiryDate: form.expiryDate?.trim() || undefined,
      cvv: form.cvv?.trim() || undefined,
      pin: form.pin?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
      createdAt: account?.createdAt ?? now,
      updatedAt: now,
    })
  }

  if (!account && !isNew) {
    return (
      <div className={styles.emptyDetail}>
        <BankEmptyIcon />
        <p>Select an account or add a new one</p>
      </div>
    )
  }

  return (
    <div className={styles.detail}>
      <div className={styles.detailHeader}>
        <h2 className={styles.detailTitle}>{isNew ? 'New Account' : account?.label}</h2>
        <div className={styles.detailActions}>
          {!isNew && account && (
            <button className={styles.deleteBtn} type="button" onClick={() => onDelete(account.id)} aria-label="Delete account">
              <TrashIcon /> Delete
            </button>
          )}
          <button className={styles.cancelBtn} type="button" onClick={onCancel}>Cancel</button>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Type toggle */}
        <div className={styles.typeToggle}>
          <button type="button" className={`${styles.typeBtn} ${accountType === 'bank' ? styles.typeBtnActive : ''}`} onClick={() => handleTypeChange('bank')}>
            <BankIcon /> Bank Account
          </button>
          <button type="button" className={`${styles.typeBtn} ${accountType === 'credit-card' ? styles.typeBtnActive : ''}`} onClick={() => handleTypeChange('credit-card')}>
            <CreditCardIcon /> Credit Card
          </button>
        </div>

        <FormField label="Label" required>
          <input className={styles.input} value={form.label ?? ''} onChange={set('label')} autoFocus={isNew} maxLength={128} placeholder={accountType === 'credit-card' ? 'e.g. Visa Platinum' : 'e.g. Main Checking'} />
        </FormField>

        <FormField label="Bank Name">
          <input className={styles.input} value={form.bankName ?? ''} onChange={set('bankName')} maxLength={256} />
        </FormField>

        {accountType === 'bank' ? (
          <>
            <SensitiveField label="Account Number" fieldKey="accountNumber" value={form.accountNumber ?? ''} onChange={set('accountNumber')} show={!!showSensitive['accountNumber']} onToggleShow={() => toggleShow('accountNumber')} onCopy={() => copyField('accountNumber', form.accountNumber ?? '')} copiedKey={copiedField} styles={styles} />
            <SensitiveField label="Routing Number" fieldKey="routingNumber" value={form.routingNumber ?? ''} onChange={set('routingNumber')} show={!!showSensitive['routingNumber']} onToggleShow={() => toggleShow('routingNumber')} onCopy={() => copyField('routingNumber', form.routingNumber ?? '')} copiedKey={copiedField} styles={styles} />
          </>
        ) : (
          <>
            <SensitiveField label="Card Number" fieldKey="cardNumber" value={form.cardNumber ?? ''} onChange={set('cardNumber')} show={!!showSensitive['cardNumber']} onToggleShow={() => toggleShow('cardNumber')} onCopy={() => copyField('cardNumber', form.cardNumber ?? '')} copiedKey={copiedField} styles={styles} />
            <div className={styles.row}>
              <FormField label="Expiry (MM/YY)">
                <input className={styles.input} value={form.expiryDate ?? ''} onChange={set('expiryDate')} placeholder="MM/YY" maxLength={5} />
              </FormField>
              <SensitiveField label="CVV" fieldKey="cvv" value={form.cvv ?? ''} onChange={set('cvv')} show={!!showSensitive['cvv']} onToggleShow={() => toggleShow('cvv')} onCopy={() => copyField('cvv', form.cvv ?? '')} copiedKey={copiedField} styles={styles} />
            </div>
          </>
        )}

        <SensitiveField label="PIN" fieldKey="pin" value={form.pin ?? ''} onChange={set('pin')} show={!!showSensitive['pin']} onToggleShow={() => toggleShow('pin')} onCopy={() => copyField('pin', form.pin ?? '')} copiedKey={copiedField} styles={styles} />

        <FormField label="Notes">
          <textarea className={`${styles.input} ${styles.textarea}`} value={form.notes ?? ''} onChange={set('notes')} rows={3} maxLength={4096} />
        </FormField>

        {error && <p className={styles.error} role="alert">{error}</p>}
        <button className={styles.saveBtn} type="submit">{isNew ? 'Add Account' : 'Save Changes'}</button>
      </form>
    </div>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }): JSX.Element {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}{required && <span className={styles.required}>*</span>}</label>
      {children}
    </div>
  )
}

interface SensitiveFieldProps {
  label: string
  fieldKey: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  show: boolean
  onToggleShow: () => void
  onCopy: () => void
  copiedKey: string | null
  styles: Record<string, string>
}

function SensitiveField({ label, fieldKey, value, onChange, show, onToggleShow, onCopy, copiedKey, styles }: SensitiveFieldProps): JSX.Element {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.fieldLabel}>{label}</label>
        <div className={styles.keyActions}>
          <button type="button" className={styles.iconBtn} onClick={onToggleShow} aria-label={show ? 'Hide' : 'Show'}>
            {show ? <EyeOffIcon /> : <EyeIcon />}
          </button>
          <button type="button" className={`${styles.iconBtn} ${copiedKey === fieldKey ? styles.copied : ''}`} onClick={onCopy} aria-label="Copy">
            {copiedKey === fieldKey ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
      </div>
      <input
        className={`${styles.input} ${styles.mono}`}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete="off"
      />
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
const BankIcon = (): JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" />
    <line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" />
    <line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" />
  </svg>
)
const CreditCardIcon = (): JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)
const TrashIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
)
const BankEmptyIcon = (): JSX.Element => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
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

export default BankAccountPanel
