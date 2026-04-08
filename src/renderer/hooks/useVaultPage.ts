import { useState, useCallback, useMemo } from 'react'
import { randomUUID } from '../utils/uuid'
import type { Credential, SubVault, VaultResult } from '../models'
import { DEFAULT_SUBVAULT_NAME } from '../models'

interface UseVaultPageResult {
  // Sub-vault management
  subVaults: SubVault[]
  activeSubVaultId: string
  setActiveSubVaultId: (id: string) => void
  addSubVault: (name: string) => void
  renameSubVault: (id: string, name: string) => void
  deleteSubVault: (id: string) => void

  // Credential list (scoped to active sub-vault, filtered by search)
  search: string
  setSearch: (q: string) => void
  filteredCredentials: Credential[]

  // Credential detail
  selectedCredentialId: string | null
  selectedCredential: Credential | null
  selectCredential: (id: string | null) => void
  addCredential: (credential: Credential) => void
  updateCredential: (credential: Credential) => void
  deleteCredential: (id: string) => void
}

function buildInitialSubVaults(result: VaultResult): SubVault[] {
  // v1.1+ files store sub-vaults directly in the payload
  if (result.subVaults && result.subVaults.length > 0) {
    return result.subVaults
  }
  // v1.0 files have a flat credentials list — wrap in default sub-vault
  return [
    {
      id: randomUUID(),
      name: DEFAULT_SUBVAULT_NAME,
      credentials: result.credentials,
    },
  ]
}

export function useVaultPage(vault: VaultResult): UseVaultPageResult {
  const [subVaults, setSubVaults] = useState<SubVault[]>(() => buildInitialSubVaults(vault))
  const [activeSubVaultId, setActiveSubVaultId] = useState<string>(() => subVaults[0].id)
  const [search, setSearch] = useState('')
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null)

  // ── Sub-vault actions ──────────────────────────────────────────────────────
  const addSubVault = useCallback((name: string) => {
    const newSv: SubVault = { id: randomUUID(), name, credentials: [] }
    setSubVaults(prev => [...prev, newSv])
  }, [])

  const renameSubVault = useCallback((id: string, name: string) => {
    setSubVaults(prev => prev.map(sv => sv.id === id ? { ...sv, name } : sv))
  }, [])

  const deleteSubVault = useCallback((id: string) => {
    setSubVaults(prev => {
      const next = prev.filter(sv => sv.id !== id)
      // Keep at least one sub-vault
      if (next.length === 0) return prev
      // If deleting the active one, switch to the first remaining
      if (id === activeSubVaultId) setActiveSubVaultId(next[0].id)
      return next
    })
  }, [activeSubVaultId])

  // ── Credential actions (scoped to active sub-vault) ───────────────────────
  const addCredential = useCallback((credential: Credential) => {
    setSubVaults(prev => prev.map(sv =>
      sv.id === activeSubVaultId
        ? { ...sv, credentials: [...sv.credentials, credential] }
        : sv
    ))
  }, [activeSubVaultId])

  const updateCredential = useCallback((credential: Credential) => {
    setSubVaults(prev => prev.map(sv =>
      sv.id === activeSubVaultId
        ? { ...sv, credentials: sv.credentials.map(c => c.id === credential.id ? credential : c) }
        : sv
    ))
  }, [activeSubVaultId])

  const deleteCredential = useCallback((id: string) => {
    setSubVaults(prev => prev.map(sv =>
      sv.id === activeSubVaultId
        ? { ...sv, credentials: sv.credentials.filter(c => c.id !== id) }
        : sv
    ))
    setSelectedCredentialId(prev => prev === id ? null : prev)
  }, [activeSubVaultId])

  // ── Derived state ──────────────────────────────────────────────────────────
  const activeSubVault = useMemo(
    () => subVaults.find(sv => sv.id === activeSubVaultId) ?? subVaults[0],
    [subVaults, activeSubVaultId],
  )

  const filteredCredentials = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return activeSubVault.credentials
    return activeSubVault.credentials.filter(c => c.label.toLowerCase().includes(q))
  }, [activeSubVault, search])

  const selectedCredential = useMemo(
    () => filteredCredentials.find(c => c.id === selectedCredentialId) ?? null,
    [filteredCredentials, selectedCredentialId],
  )

  return {
    subVaults,
    activeSubVaultId,
    setActiveSubVaultId,
    addSubVault,
    renameSubVault,
    deleteSubVault,
    search,
    setSearch,
    filteredCredentials,
    selectedCredentialId,
    selectedCredential,
    selectCredential: setSelectedCredentialId,
    addCredential,
    updateCredential,
    deleteCredential,
  }
}
