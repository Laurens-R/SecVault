import { useEffect } from 'react'
import { PasswordModal } from '../../components'
import { useVaultActions } from '../../hooks'
import type { VaultResult } from '../../models'
import styles from './HomePage.module.scss'

// ---------------------------------------------------------------------------
// Internal sub-component
// ---------------------------------------------------------------------------
interface ActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
  disabled: boolean
}

function ActionCard({ icon, title, description, onClick, disabled }: ActionCardProps): JSX.Element {
  return (
    <button className={styles.card} onClick={onClick} disabled={disabled}>
      <span className={styles.cardIcon}>{icon}</span>
      <span className={styles.cardTitle}>{title}</span>
      <span className={styles.cardDesc}>{description}</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// SVG icons
// ---------------------------------------------------------------------------
const NewVaultIcon = (): JSX.Element => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" />
    <line x1="12" y1="9" x2="12" y2="15" />
    <line x1="9" y1="12" x2="15" y2="12" />
  </svg>
)

const OpenVaultIcon = (): JSX.Element => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" />
  </svg>
)

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
function HomePage({ onVaultOpen }: { onVaultOpen: (v: VaultResult) => void }): JSX.Element {
  const {
    startCreate, startOpen, submitPassword, cancelModal,
    modalState, isLoading, error, defaultDir, lastResult,
  } = useVaultActions()

  useEffect(() => {
    if (lastResult) onVaultOpen(lastResult)
  }, [lastResult, onVaultOpen])

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>SecVault</h1>
        <p className={styles.subtitle}>Your personal encrypted vault</p>
      </div>

      <div className={styles.actions}>
        <ActionCard
          icon={<NewVaultIcon />}
          title="New Vault"
          description="Create a new encrypted vault file"
          onClick={startCreate}
          disabled={isLoading || modalState !== null}
        />
        <ActionCard
          icon={<OpenVaultIcon />}
          title="Open Vault"
          description="Open an existing vault file"
          onClick={startOpen}
          disabled={isLoading || modalState !== null}
        />
      </div>

      {/* Page-level error (dialog failures, not password errors) */}
      {!modalState && error && <p className={styles.error}>{error}</p>}

      {defaultDir && (
        <p className={styles.storageHint}>
          Vaults stored in <span className={styles.storageDir}>{defaultDir}</span>
        </p>
      )}

      {modalState && (
        <PasswordModal
          mode={modalState.type}
          vaultName={modalState.vaultName}
          isLoading={isLoading}
          error={error}
          onSubmit={submitPassword}
          onCancel={cancelModal}
        />
      )}
    </div>
  )
}

export default HomePage
