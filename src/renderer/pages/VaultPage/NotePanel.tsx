import { useState, useCallback, useMemo, useEffect, type FormEvent } from 'react'
import type { Note, SubVaultItem } from '../../models'
import { randomUUID } from '../../utils/uuid'
import styles from './NotePanel.module.scss'

interface NotePanelProps {
  notes: Note[]
  onAdd: (item: SubVaultItem) => void
  onUpdate: (item: SubVaultItem & { id: string }) => void
  onDelete: (id: string) => void
}

// ── NotePanel ─────────────────────────────────────────────────────────────────
function NotePanel({ notes, onAdd, onUpdate, onDelete }: NotePanelProps): JSX.Element {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [isNew, setIsNew] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return notes
    return notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
  }, [notes, search])

  const selected = filtered.find(n => n.id === selectedId) ?? null

  const handleAddNew = useCallback(() => { setSelectedId(null); setIsNew(true) }, [])
  const handleSelect = useCallback((id: string) => { setIsNew(false); setSelectedId(id) }, [])

  const handleSave = useCallback((note: Note) => {
    if (isNew) onAdd(note); else onUpdate(note)
    setIsNew(false)
    setSelectedId(note.id)
  }, [isNew, onAdd, onUpdate])

  const handleDelete = useCallback((id: string) => {
    onDelete(id)
    setIsNew(false)
    setSelectedId(null)
  }, [onDelete])

  const handleCancel = useCallback(() => { setIsNew(false); setSelectedId(null) }, [])

  return (
    <>
      <NoteList
        notes={filtered}
        selectedId={selectedId}
        search={search}
        onSearchChange={setSearch}
        onSelect={handleSelect}
        onAddNew={handleAddNew}
      />
      <NoteDetail
        note={selected}
        isNew={isNew}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={handleCancel}
      />
    </>
  )
}

// ── NoteList ──────────────────────────────────────────────────────────────────
interface NoteListProps {
  notes: Note[]
  selectedId: string | null
  search: string
  onSearchChange: (q: string) => void
  onSelect: (id: string) => void
  onAddNew: () => void
}

function NoteList({ notes, selectedId, search, onSearchChange, onSelect, onAddNew }: NoteListProps): JSX.Element {
  return (
    <div className={styles.listPanel}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <SearchIcon />
          <input
            className={styles.search}
            type="search"
            placeholder="Search notes…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            aria-label="Search notes"
          />
        </div>
        <button className={styles.addBtn} onClick={onAddNew} title="New note" aria-label="New note">
          <PlusIcon />
        </button>
      </div>

      <ul className={styles.list} role="listbox" aria-label="Notes">
        {notes.length === 0 ? (
          <li className={styles.empty}>{search ? 'No results' : 'No notes yet'}</li>
        ) : (
          notes.map(n => (
            <li
              key={n.id}
              className={`${styles.item} ${n.id === selectedId ? styles.active : ''}`}
              role="option"
              aria-selected={n.id === selectedId}
            >
              <button className={styles.itemBtn} onClick={() => onSelect(n.id)}>
                <span className={styles.iconWrap}><NoteIcon /></span>
                <span className={styles.info}>
                  <span className={styles.label}>{n.title || 'Untitled'}</span>
                  <span className={styles.sub}>{n.content.slice(0, 60) || 'No content'}</span>
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

// ── NoteDetail ────────────────────────────────────────────────────────────────
interface NoteDetailProps {
  note: Note | null
  isNew: boolean
  onSave: (note: Note) => void
  onDelete: (id: string) => void
  onCancel: () => void
}

function NoteDetail({ note, isNew, onSave, onDelete, onCancel }: NoteDetailProps): JSX.Element {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTitle(note?.title ?? '')
    setContent(note?.content ?? '')
    setError(null)
  }, [note?.id, isNew]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required.'); return }
    const now = new Date()
    onSave({
      id: note?.id ?? randomUUID(),
      title: title.trim(),
      content: content.trim(),
      createdAt: note?.createdAt ?? now,
      updatedAt: now,
    })
  }

  if (!note && !isNew) {
    return (
      <div className={styles.emptyDetail}>
        <NoteEmptyIcon />
        <p>Select a note or create a new one</p>
      </div>
    )
  }

  return (
    <div className={styles.detail}>
      <div className={styles.detailHeader}>
        <h2 className={styles.detailTitle}>{isNew ? 'New Note' : (note?.title || 'Untitled')}</h2>
        <div className={styles.detailActions}>
          {!isNew && note && (
            <button className={styles.deleteBtn} type="button" onClick={() => onDelete(note.id)} aria-label="Delete note">
              <TrashIcon /> Delete
            </button>
          )}
          <button className={styles.cancelBtn} type="button" onClick={onCancel}>Cancel</button>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Title <span className={styles.required}>*</span></label>
          <input className={styles.input} value={title} onChange={e => { setTitle(e.target.value); setError(null) }} autoFocus={isNew} maxLength={256} />
        </div>
        <div className={`${styles.field} ${styles.fieldGrow}`}>
          <label className={styles.fieldLabel}>Content</label>
          <textarea className={`${styles.input} ${styles.textarea}`} value={content} onChange={e => setContent(e.target.value)} />
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button className={styles.saveBtn} type="submit">{isNew ? 'Add Note' : 'Save Changes'}</button>
      </form>
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
const NoteIcon = (): JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
)
const NoteEmptyIcon = (): JSX.Element => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)
const TrashIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
)

export default NotePanel
