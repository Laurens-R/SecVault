import { useState, useCallback, useMemo } from 'react'
import type { Credential, SubVaultItem } from '../../models'
import CredentialList from './CredentialList'
import CredentialDetail from './CredentialDetail'

interface CredentialPanelProps {
  credentials: Credential[]
  onAdd: (item: SubVaultItem) => void
  onUpdate: (item: SubVaultItem & { id: string }) => void
  onDelete: (id: string) => void
}

function CredentialPanel({ credentials, onAdd, onUpdate, onDelete }: CredentialPanelProps): JSX.Element {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [isNew, setIsNew] = useState(false)

  const filteredCredentials = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return credentials
    return credentials.filter(c => c.label.toLowerCase().includes(q))
  }, [credentials, search])

  const selectedCredential = filteredCredentials.find(c => c.id === selectedId) ?? null

  const handleAddNew = useCallback(() => {
    setSelectedId(null)
    setIsNew(true)
  }, [])

  const handleSelect = useCallback((id: string) => {
    setIsNew(false)
    setSelectedId(id)
  }, [])

  const handleSave = useCallback((credential: Credential) => {
    if (isNew) {
      onAdd(credential)
    } else {
      onUpdate(credential)
    }
    setIsNew(false)
    setSelectedId(credential.id)
  }, [isNew, onAdd, onUpdate])

  const handleDelete = useCallback((id: string) => {
    onDelete(id)
    setIsNew(false)
    setSelectedId(null)
  }, [onDelete])

  const handleCancel = useCallback(() => {
    setIsNew(false)
    setSelectedId(null)
  }, [])

  return (
    <>
      <CredentialList
        credentials={filteredCredentials}
        selectedId={selectedId}
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
    </>
  )
}

export default CredentialPanel
