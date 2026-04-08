import { useState, useCallback, useMemo } from 'react'
import { randomUUID } from '../utils/uuid'
import type { Credential, SubVault, SubVaultItem, SubVaultType, VaultResult } from '../models'
import { DEFAULT_SUBVAULT_NAME } from '../models'

interface UseVaultPageResult {
  // Sub-vault management
  subVaults: SubVault[]
  activeSubVaultId: string
  activeSubVault: SubVault
  setActiveSubVaultId: (id: string) => void
  addSubVault: (name: string, type: SubVaultType) => void
  renameSubVault: (id: string, name: string) => void
  deleteSubVault: (id: string) => void

  // Generic item CRUD (scoped to active sub-vault)
  addItem: (item: SubVaultItem) => void
  updateItem: (item: SubVaultItem & { id: string }) => void
  deleteItem: (id: string) => void
}

function buildInitialSubVaults(result: VaultResult): SubVault[] {
  // v1.1+ files store sub-vaults directly in the payload
  if (result.subVaults && result.subVaults.length > 0) {
    return result.subVaults as SubVault[]
  }
  // v1.0 files have a flat credentials list — wrap in default credential sub-vault
  return [
    {
      id: randomUUID(),
      name: DEFAULT_SUBVAULT_NAME,
      type: 'credentials',
      credentials: result.credentials as Credential[],
    },
  ]
}

export function useVaultPage(vault: VaultResult): UseVaultPageResult {
  const [subVaults, setSubVaults] = useState<SubVault[]>(() => buildInitialSubVaults(vault))
  const [activeSubVaultId, setActiveSubVaultId] = useState<string>(() => subVaults[0].id)

  // ── Sub-vault actions ──────────────────────────────────────────────────────
  const addSubVault = useCallback((name: string, type: SubVaultType) => {
    const newSv: SubVault =
      type === 'credentials'
        ? { id: randomUUID(), name, type: 'credentials', credentials: [] }
        : { id: randomUUID(), name, type: type as Exclude<SubVaultType, 'credentials'>, items: [] as never[] }
    setSubVaults(prev => [...prev, newSv])
  }, [])

  const renameSubVault = useCallback((id: string, name: string) => {
    setSubVaults(prev => prev.map(sv => sv.id === id ? { ...sv, name } : sv))
  }, [])

  const deleteSubVault = useCallback((id: string) => {
    setSubVaults(prev => {
      const next = prev.filter(sv => sv.id !== id)
      if (next.length === 0) return prev
      if (id === activeSubVaultId) setActiveSubVaultId(next[0].id)
      return next
    })
  }, [activeSubVaultId])

  // ── Generic item CRUD (scoped to active sub-vault) ────────────────────────
  const addItem = useCallback((item: SubVaultItem) => {
    setSubVaults(prev => prev.map(sv => {
      if (sv.id !== activeSubVaultId) return sv
      if (sv.type === 'credentials') return { ...sv, credentials: [...sv.credentials, item as Credential] } as SubVault
      return { ...sv, items: [...sv.items, item] } as SubVault
    }))
  }, [activeSubVaultId])

  const updateItem = useCallback((item: SubVaultItem & { id: string }) => {
    setSubVaults(prev => prev.map(sv => {
      if (sv.id !== activeSubVaultId) return sv
      if (sv.type === 'credentials') return { ...sv, credentials: sv.credentials.map(c => c.id === item.id ? item as Credential : c) } as SubVault
      return { ...sv, items: sv.items.map(i => i.id === item.id ? item : i) } as SubVault
    }))
  }, [activeSubVaultId])

  const deleteItem = useCallback((id: string) => {
    setSubVaults(prev => prev.map(sv => {
      if (sv.id !== activeSubVaultId) return sv
      if (sv.type === 'credentials') return { ...sv, credentials: sv.credentials.filter(c => c.id !== id) } as SubVault
      return { ...sv, items: sv.items.filter(i => i.id !== id) } as SubVault
    }))
  }, [activeSubVaultId])

  // ── Derived state ──────────────────────────────────────────────────────────
  const activeSubVault = useMemo(
    () => subVaults.find(sv => sv.id === activeSubVaultId) ?? subVaults[0],
    [subVaults, activeSubVaultId],
  )

  return {
    subVaults,
    activeSubVaultId,
    activeSubVault,
    setActiveSubVaultId,
    addSubVault,
    renameSubVault,
    deleteSubVault,
    addItem,
    updateItem,
    deleteItem,
  }
}
