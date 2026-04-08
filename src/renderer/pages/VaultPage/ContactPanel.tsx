import { useState, useCallback, useMemo, useEffect, type FormEvent } from 'react'
import type { Contact, SubVaultItem } from '../../models'
import { randomUUID } from '../../utils/uuid'
import styles from './ContactPanel.module.scss'

interface ContactPanelProps {
  contacts: Contact[]
  onAdd: (item: SubVaultItem) => void
  onUpdate: (item: SubVaultItem & { id: string }) => void
  onDelete: (id: string) => void
}

// ── ContactPanel ──────────────────────────────────────────────────────────────
function ContactPanel({ contacts, onAdd, onUpdate, onDelete }: ContactPanelProps): JSX.Element {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [isNew, setIsNew] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      (c.company ?? '').toLowerCase().includes(q),
    )
  }, [contacts, search])

  const selected = filtered.find(c => c.id === selectedId) ?? null

  const handleAddNew = useCallback(() => { setSelectedId(null); setIsNew(true) }, [])
  const handleSelect = useCallback((id: string) => { setIsNew(false); setSelectedId(id) }, [])

  const handleSave = useCallback((contact: Contact) => {
    if (isNew) onAdd(contact); else onUpdate(contact)
    setIsNew(false)
    setSelectedId(contact.id)
  }, [isNew, onAdd, onUpdate])

  const handleDelete = useCallback((id: string) => {
    onDelete(id)
    setIsNew(false)
    setSelectedId(null)
  }, [onDelete])

  const handleCancel = useCallback(() => { setIsNew(false); setSelectedId(null) }, [])

  return (
    <>
      <ContactList
        contacts={filtered}
        selectedId={selectedId}
        search={search}
        onSearchChange={setSearch}
        onSelect={handleSelect}
        onAddNew={handleAddNew}
      />
      <ContactDetail
        contact={selected}
        isNew={isNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={handleCancel}
      />
    </>
  )
}

// ── ContactList ───────────────────────────────────────────────────────────────
interface ContactListProps {
  contacts: Contact[]
  selectedId: string | null
  search: string
  onSearchChange: (q: string) => void
  onSelect: (id: string) => void
  onAddNew: () => void
}

function ContactList({ contacts, selectedId, search, onSearchChange, onSelect, onAddNew }: ContactListProps): JSX.Element {
  return (
    <div className={styles.listPanel}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <SearchIcon />
          <input
            className={styles.search}
            type="search"
            placeholder="Search contacts…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            aria-label="Search contacts"
          />
        </div>
        <button className={styles.addBtn} onClick={onAddNew} title="New contact" aria-label="New contact">
          <PlusIcon />
        </button>
      </div>

      <ul className={styles.list} role="listbox" aria-label="Contacts">
        {contacts.length === 0 ? (
          <li className={styles.empty}>{search ? 'No results' : 'No contacts yet'}</li>
        ) : (
          contacts.map(c => (
            <li
              key={c.id}
              className={`${styles.item} ${c.id === selectedId ? styles.active : ''}`}
              role="option"
              aria-selected={c.id === selectedId}
            >
              <button className={styles.itemBtn} onClick={() => onSelect(c.id)}>
                <span className={styles.avatar}>{c.name.charAt(0).toUpperCase()}</span>
                <span className={styles.info}>
                  <span className={styles.label}>{c.name}</span>
                  <span className={styles.sub}>{c.email ?? c.company ?? c.phone ?? ''}</span>
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

// ── ContactDetail ─────────────────────────────────────────────────────────────
interface ContactDetailProps {
  contact: Contact | null
  isNew: boolean
  onSave: (contact: Contact) => void
  onDelete: (id: string) => void
  onCancel: () => void
}

const EMPTY = { name: '', email: '', phone: '', company: '', address: '', notes: '' }

function ContactDetail({ contact, isNew, onSave, onDelete, onCancel }: ContactDetailProps): JSX.Element {
  const [form, setForm] = useState({ ...EMPTY })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm({
      name: contact?.name ?? '',
      email: contact?.email ?? '',
      phone: contact?.phone ?? '',
      company: contact?.company ?? '',
      address: contact?.address ?? '',
      notes: contact?.notes ?? '',
    })
    setError(null)
  }, [contact?.id, isNew]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setError(null)
  }

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required.'); return }
    const now = new Date()
    onSave({
      id: contact?.id ?? randomUUID(),
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      company: form.company.trim() || undefined,
      address: form.address.trim() || undefined,
      notes: form.notes.trim() || undefined,
      createdAt: contact?.createdAt ?? now,
      updatedAt: now,
    })
  }

  if (!contact && !isNew) {
    return (
      <div className={styles.emptyDetail}>
        <ContactEmptyIcon />
        <p>Select a contact or add a new one</p>
      </div>
    )
  }

  return (
    <div className={styles.detail}>
      <div className={styles.detailHeader}>
        <h2 className={styles.detailTitle}>{isNew ? 'New Contact' : contact?.name}</h2>
        <div className={styles.detailActions}>
          {!isNew && contact && (
            <button className={styles.deleteBtn} type="button" onClick={() => onDelete(contact.id)} aria-label="Delete contact">
              <TrashIcon /> Delete
            </button>
          )}
          <button className={styles.cancelBtn} type="button" onClick={onCancel}>Cancel</button>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <FormField label="Name" required>
          <input className={styles.input} value={form.name} onChange={set('name')} autoFocus={isNew} maxLength={256} />
        </FormField>
        <FormField label="Email">
          <input className={styles.input} type="email" value={form.email} onChange={set('email')} maxLength={256} />
        </FormField>
        <FormField label="Phone">
          <input className={styles.input} type="tel" value={form.phone} onChange={set('phone')} maxLength={64} />
        </FormField>
        <FormField label="Company">
          <input className={styles.input} value={form.company} onChange={set('company')} maxLength={256} />
        </FormField>
        <FormField label="Address">
          <textarea className={`${styles.input} ${styles.textarea}`} value={form.address} onChange={set('address')} rows={2} maxLength={512} />
        </FormField>
        <FormField label="Notes">
          <textarea className={`${styles.input} ${styles.textarea}`} value={form.notes} onChange={set('notes')} rows={3} maxLength={4096} />
        </FormField>

        {error && <p className={styles.error} role="alert">{error}</p>}
        <button className={styles.saveBtn} type="submit">{isNew ? 'Add Contact' : 'Save Changes'}</button>
      </form>
    </div>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }): JSX.Element {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}{required && <span className={styles.required}>*</span>}</label>
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
const TrashIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
)
const ContactEmptyIcon = (): JSX.Element => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)

export default ContactPanel
