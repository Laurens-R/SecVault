import { useState, useCallback, useRef, useEffect } from 'react'
import type { SubVault, VaultResult } from '../../models'
import { useVaultPage } from '../../hooks'
import { vaultService } from '../../services'
import SubVaultSidebar from './SubVaultSidebar'
import CredentialPanel from './CredentialPanel'
import NotePanel from './NotePanel'
import LicensePanel from './LicensePanel'
import ContactPanel from './ContactPanel'
import BankAccountPanel from './BankAccountPanel'
import styles from './VaultPage.module.scss'

interface VaultPageProps {
  vault: VaultResult
  password: string
  onLock: () => void
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function VaultPage({ vault, password, onLock }: VaultPageProps): JSX.Element {
  const {
    subVaults,
    activeSubVaultId,
    activeSubVault,
    setActiveSubVaultId,
    addSubVault,
    deleteSubVault,
    addItem,
    updateItem,
    deleteItem,
  } = useVaultPage(vault)

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lockPending, setLockPending] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)
  const latestSave = useRef<(sv: SubVault[]) => Promise<void>>()

  // ── Auto-save ──────────────────────────────────────────────────────────────
  const executeSave = useCallback(async (currentSubVaults: SubVault[]) => {
    setSaveStatus('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    try {
      await vaultService.saveVault({
        filePath: vault.filePath,
        password,
        vaultId: vault.id,
        vaultName: vault.name,
        createdAt: vault.createdAt,
        subVaults: currentSubVaults,
      })
      setSaveStatus('saved')
      saveTimer.current = setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
    }
  }, [vault, password])

  // Keep a stable ref so the useEffect never needs it in deps
  latestSave.current = executeSave

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    void latestSave.current!(subVaults)
  }, [subVaults])

  const handleLockClick = useCallback(() => {
    if (saveStatus === 'saving' || saveStatus === 'error') {
      setLockPending(true)
    } else {
      onLock()
    }
  }, [saveStatus, onLock])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.vaultInfo}>
          <VaultIcon />
          <span className={styles.vaultName}>{vault.name}</span>
        </div>
        <div className={styles.headerRight}>
          <SaveIndicator status={saveStatus} />
          <button className={styles.lockBtn} onClick={handleLockClick} aria-label="Lock vault">
            <LockIcon />
            Lock
          </button>
        </div>
      </header>

      <div className={styles.panels}>
        <SubVaultSidebar
          vaultName={vault.name}
          subVaults={subVaults}
          activeId={activeSubVaultId}
          onSelect={setActiveSubVaultId}
          onAdd={addSubVault}
          onDelete={deleteSubVault}
        />

        {activeSubVault.type === 'credentials' && (
          <CredentialPanel
            credentials={activeSubVault.credentials}
            onAdd={addItem}
            onUpdate={updateItem}
            onDelete={deleteItem}
          />
        )}
        {activeSubVault.type === 'notes' && (
          <NotePanel
            notes={activeSubVault.items}
            onAdd={addItem}
            onUpdate={updateItem}
            onDelete={deleteItem}
          />
        )}
        {activeSubVault.type === 'licenses' && (
          <LicensePanel
            licenses={activeSubVault.items}
            onAdd={addItem}
            onUpdate={updateItem}
            onDelete={deleteItem}
          />
        )}
        {activeSubVault.type === 'contacts' && (
          <ContactPanel
            contacts={activeSubVault.items}
            onAdd={addItem}
            onUpdate={updateItem}
            onDelete={deleteItem}
          />
        )}
        {activeSubVault.type === 'bank' && (
          <BankAccountPanel
            accounts={activeSubVault.items}
            onAdd={addItem}
            onUpdate={updateItem}
            onDelete={deleteItem}
          />
        )}
      </div>

      {lockPending && (
        <LockConfirmModal
          isSaving={saveStatus === 'saving'}
          onRetry={() => { setLockPending(false); void executeSave(subVaults) }}
          onLockAnyway={() => { setLockPending(false); onLock() }}
          onCancel={() => setLockPending(false)}
        />
      )}
    </div>
  )
}

const VaultIcon = (): JSX.Element => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" />
  </svg>
)

const LockIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
)

// ── Save status indicator ────────────────────────────────────────────────────
function SaveIndicator({ status }: { status: SaveStatus }): JSX.Element | null {
  if (status === 'idle') return null
  return (
    <span className={`${styles.saveIndicator} ${styles[`save_${status}`]}`} aria-live="polite">
      {status === 'saving' && <><SpinnerIcon /> Saving…</>}
      {status === 'saved'  && <><CheckIcon /> Saved</>}
      {status === 'error'  && <><ErrorIcon /> Save failed</>}
    </span>
  )
}

// ── Lock confirmation modal ──────────────────────────────────────────────────
interface LockConfirmModalProps {
  isSaving: boolean
  onRetry: () => void
  onLockAnyway: () => void
  onCancel: () => void
}

function LockConfirmModal({ isSaving, onRetry, onLockAnyway, onCancel }: LockConfirmModalProps): JSX.Element {
  return (
    <div className={styles.confirmOverlay} role="dialog" aria-modal="true" aria-label="Unsaved changes">
      <div className={styles.confirmCard}>
        <WarningIcon />
        <h3 className={styles.confirmTitle}>
          {isSaving ? 'Saving in progress…' : 'Save failed'}
        </h3>
        <p className={styles.confirmBody}>
          {isSaving
            ? 'The vault is still being saved. Please wait or lock anyway and risk losing the latest changes.'
            : 'The last save attempt failed. Lock anyway and lose unsaved changes, or retry saving first.'}
        </p>
        <div className={styles.confirmActions}>
          {!isSaving && (
            <button className={styles.confirmRetry} onClick={onRetry}>
              Retry Save
            </button>
          )}
          <button className={styles.confirmLock} onClick={onLockAnyway}>
            Lock Anyway
          </button>
          <button className={styles.confirmCancel} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Icons ────────────────────────────────────────────────────────────────────
const SpinnerIcon = (): JSX.Element => (
  <svg className={styles.spin} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
)

const CheckIcon = (): JSX.Element => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ErrorIcon = (): JSX.Element => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const WarningIcon = (): JSX.Element => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

export default VaultPage
