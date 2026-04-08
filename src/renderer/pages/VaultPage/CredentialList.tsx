import type { Credential } from '../../../models'
import styles from './CredentialList.module.scss'

interface CredentialListProps {
  credentials: Credential[]
  selectedId: string | null
  search: string
  onSearchChange: (q: string) => void
  onSelect: (id: string) => void
  onAddNew: () => void
}

function CredentialList({
  credentials,
  selectedId,
  search,
  onSearchChange,
  onSelect,
  onAddNew,
}: CredentialListProps): JSX.Element {
  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <SearchIcon />
          <input
            className={styles.search}
            type="search"
            placeholder="Search credentials…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            aria-label="Search credentials"
          />
        </div>
        <button className={styles.addBtn} onClick={onAddNew} title="New credential" aria-label="New credential">
          <PlusIcon />
        </button>
      </div>

      <ul className={styles.list} role="listbox" aria-label="Credentials">
        {credentials.length === 0 ? (
          <li className={styles.empty}>
            {search ? 'No results' : 'No credentials yet'}
          </li>
        ) : (
          credentials.map(c => (
            <li
              key={c.id}
              className={`${styles.item} ${c.id === selectedId ? styles.active : ''}`}
              role="option"
              aria-selected={c.id === selectedId}
            >
              <button className={styles.itemBtn} onClick={() => onSelect(c.id)}>
                <span className={styles.avatar}>{c.label.charAt(0).toUpperCase()}</span>
                <span className={styles.info}>
                  <span className={styles.label}>{c.label}</span>
                  <span className={styles.username}>{c.username}</span>
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

const SearchIcon = (): JSX.Element => (
  <svg className="searchIcon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const PlusIcon = (): JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

export default CredentialList
