import { useState, useCallback } from 'react'
import type { Credential, VaultResult } from '../../models'
import { useVaultPage } from '../../hooks'
import SubVaultSidebar from './SubVaultSidebar'
import CredentialList from './CredentialList'
import CredentialDetail from './CredentialDetail'
import styles from './VaultPage.module.scss'

interface VaultPageProps {
  vault: VaultResult
  onLock: () => void
}

function VaultPage({ vault, onLock }: VaultPageProps): JSX.Element {
  const {
    subVaults,
    activeSubVaultId,
    setActiveSubVaultId,
    addSubVault,
    deleteSubVault,
    search,
    setSearch,
    filteredCredentials,
    selectedCredentialId,
    selectCredential,
    addCredential,
    updateCredential,
    deleteCredential,
  } = useVaultPage(vault)

  const [isNew, setIsNew] = useState(false)

  const handleAddNew = useCallback(() => {
    selectCredential(null)
    setIsNew(true)
  }, [selectCredential])

  const handleSelect = useCallback((id: string) => {
    setIsNew(false)
    selectCredential(id)
  }, [selectCredential])

  const handleSave = useCallback((credential: Credential) => {
    if (isNew) {
      addCredential(credential)
    } else {
      updateCredential(credential)
    }
    setIsNew(false)
    selectCredential(credential.id)
  }, [isNew, addCredential, updateCredential, selectCredential])

  const handleDelete = useCallback((id: string) => {
    deleteCredential(id)
    setIsNew(false)
    selectCredential(null)
  }, [deleteCredential, selectCredential])

  const handleCancel = useCallback(() => {
    setIsNew(false)
    selectCredential(null)
  }, [selectCredential])

  const selectedCredential = filteredCredentials.find(c => c.id === selectedCredentialId) ?? null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.vaultInfo}>
          <VaultIcon />
          <span className={styles.vaultName}>{vault.name}</span>
        </div>
        <button className={styles.lockBtn} onClick={onLock} aria-label="Lock vault">
          <LockIcon />
          Lock
        </button>
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

        <CredentialList
          credentials={filteredCredentials}
          selectedId={selectedCredentialId}
          search={search}
          onSearchChange={setSearch}
          onSelect={handleSelect}
          onAddNew={handleAddNew}
        />

        <CredentialDetail
          credential={selectedCredential}
          isNew={isNew}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={handleCancel}
        />
      </div>
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

export default VaultPage
