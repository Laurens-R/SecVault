import { useState, useEffect, useCallback } from 'react'
import { vaultService } from '../services'
import type { VaultResult, RecentVault } from '../models'

type ModalState =
  | null
  | { type: 'create'; filePath: string; vaultName: string }
  | { type: 'open';   filePath: string; vaultName: string }

interface UseVaultActionsResult {
  startCreate: () => Promise<void>
  startOpen: () => Promise<void>
  startOpenRecent: (filePath: string, name: string) => void
  submitPassword: (password: string) => Promise<void>
  cancelModal: () => void
  modalState: ModalState
  isLoading: boolean
  error: string | null
  defaultDir: string
  lastResult: VaultResult | null
  lastPassword: string
  recentVaults: RecentVault[]
}

export function useVaultActions(): UseVaultActionsResult {
  const [modalState, setModalState] = useState<ModalState>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [defaultDir, setDefaultDir] = useState('')
  const [lastResult, setLastResult] = useState<VaultResult | null>(null)
  const [lastPassword, setLastPassword] = useState('')
  const [recentVaults, setRecentVaults] = useState<RecentVault[]>([])

  useEffect(() => {
    vaultService.getDefaultDir().then(setDefaultDir).catch(console.error)
    vaultService.getRecentVaults().then(setRecentVaults).catch(console.error)
  }, [])

  const startCreate = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const result = await vaultService.selectSavePath()
      if (result) {
        const vaultName = result.filePath.split(/[/\\]/).pop()?.replace(/\.vault$/i, '') ?? 'New Vault'
        setModalState({ type: 'create', filePath: result.filePath, vaultName })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the save dialog.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const startOpen = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const result = await vaultService.selectOpenPath()
      if (result) {
        setModalState({ type: 'open', filePath: result.filePath, vaultName: result.name })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the file dialog.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const startOpenRecent = useCallback((filePath: string, name: string) => {
    setError(null)
    setModalState({ type: 'open', filePath, vaultName: name })
  }, [])

  const submitPassword = useCallback(async (password: string) => {
    if (!modalState) return
    setError(null)
    setIsLoading(true)
    try {
      if (modalState.type === 'create') {
        const result = await vaultService.createVault({ filePath: modalState.filePath, password })
        await vaultService.addRecentVault({ filePath: modalState.filePath, name: result.name })
        setRecentVaults(await vaultService.getRecentVaults())
        setLastResult(result)
        setLastPassword(password)
        setModalState(null)
      } else {
        const result = await vaultService.openVault({ filePath: modalState.filePath, password })
        await vaultService.addRecentVault({ filePath: modalState.filePath, name: result.name })
        setRecentVaults(await vaultService.getRecentVaults())
        setLastResult(result)
        setLastPassword(password)
        setModalState(null)
      }
    } catch (err) {
      // Keep modal open, surface error inside it
      setError(err instanceof Error ? err.message : 'Operation failed.')
    } finally {
      setIsLoading(false)
    }
  }, [modalState])

  const cancelModal = useCallback(() => {
    setModalState(null)
    setError(null)
  }, [])

  return { startCreate, startOpen, startOpenRecent, submitPassword, cancelModal, modalState, isLoading, error, defaultDir, lastResult, lastPassword, recentVaults }
}
