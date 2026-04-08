import { useState, type FormEvent } from 'react'
import type { SubVault } from '../../models'
import styles from './SubVaultSidebar.module.scss'

interface SubVaultSidebarProps {
  vaultName: string
  subVaults: SubVault[]
  activeId: string
  onSelect: (id: string) => void
  onAdd: (name: string) => void
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

  const handleAddSubmit = (e: FormEvent): void => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    onAdd(name)
    setNewName('')
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
                  <FolderIcon />
                  <span>{sv.name}</span>
                  <span className={styles.count}>{sv.credentials.length}</span>
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

const FolderIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" />
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

export default SubVaultSidebar
