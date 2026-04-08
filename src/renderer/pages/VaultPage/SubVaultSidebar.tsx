import { useState, type FormEvent } from 'react'
import type { SubVault, SubVaultType } from '../../models'
import { getSubVaultItemCount } from '../../models'
import { Select } from '../../components'
import type { SelectOption } from '../../components'
import styles from './SubVaultSidebar.module.scss'

interface SubVaultSidebarProps {
  vaultName: string
  subVaults: SubVault[]
  activeId: string
  onSelect: (id: string) => void
  onAdd: (name: string, type: SubVaultType) => void
  onDelete: (id: string) => void
}

function SubVaultSidebar({
  vaultName,
  subVaults,
  activeId,
  onSelect,
  onAdd,
  onDelete,
}: SubVaultSidebarProps): JSX.Element {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<SubVaultType>('credentials')

  const handleAddSubmit = (e: FormEvent): void => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    onAdd(name, newType)
    setNewName('')
    setNewType('credentials')
    setAdding(false)
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.vaultName} title={vaultName}>{vaultName}</span>
      </div>

      <nav className={styles.nav} aria-label="Sub-vaults">
        <ul className={styles.list}>
          {subVaults.map(sv => (
            <li key={sv.id}>
              <div
                className={`${styles.item} ${sv.id === activeId ? styles.active : ''}`}
              >
                <button
                  className={styles.itemLabel}
                  onClick={() => onSelect(sv.id)}
                  aria-current={sv.id === activeId ? 'page' : undefined}
                >
                  <SubVaultTypeIcon type={sv.type} />
                  <span>{sv.name}</span>
                  <span className={styles.count}>{getSubVaultItemCount(sv)}</span>
                </button>
                {subVaults.length > 1 && (
                  <button
                    className={styles.deleteBtn}
                    onClick={() => onDelete(sv.id)}
                    aria-label={`Delete ${sv.name}`}
                    title="Delete"
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        {adding ? (
          <form className={styles.addForm} onSubmit={handleAddSubmit}>
            <input
              className={styles.addInput}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Sub-vault name"
              autoFocus
              maxLength={64}
            />
            <Select<SubVaultType>
              options={SUBVAULT_TYPES}
              value={newType}
              onChange={setNewType}
              label="Type"
            />
            <div className={styles.addActions}>
              <button type="submit" className={styles.confirmBtn}>Add</button>
              <button type="button" className={styles.cancelBtn} onClick={() => setAdding(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <button className={styles.addBtn} onClick={() => setAdding(true)}>
            <PlusIcon />
            New Sub-vault
          </button>
        )}
      </div>
    </aside>
  )
}

// ── Type icon ─────────────────────────────────────────────────────────────────
function SubVaultTypeIcon({ type }: { type: SubVaultType }): JSX.Element {
  switch (type) {
    case 'credentials': return <KeyIcon />
    case 'notes':       return <NoteIcon />
    case 'licenses':    return <TagIcon />
    case 'contacts':    return <UserIcon />
    case 'bank':        return <CardIcon />
  }
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const KeyIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
)
const NoteIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)
const TagIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
)
const UserIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
const CardIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)
const TrashIcon = (): JSX.Element => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
)
const PlusIcon = (): JSX.Element => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

// Defined after icons so JSX references are already declared
const SUBVAULT_TYPES: SelectOption<SubVaultType>[] = [
  { value: 'credentials', label: 'Credentials', icon: <KeyIcon /> },
  { value: 'notes',       label: 'Notes',        icon: <NoteIcon /> },
  { value: 'licenses',    label: 'Licenses',     icon: <TagIcon /> },
  { value: 'contacts',    label: 'Contacts',     icon: <UserIcon /> },
  { value: 'bank',        label: 'Bank & Cards', icon: <CardIcon /> },
]

export default SubVaultSidebar
