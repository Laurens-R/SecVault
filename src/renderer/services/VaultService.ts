import type { Credential, NewCredential, VaultResult } from '../models'
import { ipcService } from './IpcService'

/**
 * VaultService
 *
 * Encapsulates all vault and credential business logic.
 * Persistence and encryption are handled by the main process via IpcService.
 */
export class VaultService {
  getDefaultDir(): Promise<string> {
    return ipcService.getVaultDefaultDir()
  }

  selectSavePath(): Promise<{ filePath: string } | null> {
    return ipcService.selectVaultSavePath()
  }

  createVault(args: { filePath: string; password: string }): Promise<VaultResult> {
    return ipcService.createVault(args)
  }

  selectOpenPath(): Promise<{ filePath: string; name: string } | null> {
    return ipcService.selectVaultOpenPath()
  }

  openVault(args: { filePath: string; password: string }): Promise<VaultResult> {
    return ipcService.openVault(args)
  }

  addCredential(_vaultId: string, _credential: NewCredential): Promise<Credential> {
    // TODO: implement via ipcService
    throw new Error('Not implemented')
  }
}

export const vaultService = new VaultService()
