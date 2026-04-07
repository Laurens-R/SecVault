import type { Credential, NewCredential, Vault } from '../models'
import { VaultStatus } from '../models'

/**
 * VaultService
 *
 * Encapsulates all vault and credential business logic.
 * Data persistence and encryption are delegated to the main process
 * via IPC (to be wired up when main-process handlers are added).
 */
export class VaultService {
  private status: VaultStatus = VaultStatus.Locked

  getStatus(): VaultStatus {
    return this.status
  }

  /**
   * Unlock the vault with the given master password.
   * Replace this stub with an IPC call to the main process.
   */
  async unlock(_masterPassword: string): Promise<Vault> {
    this.status = VaultStatus.Loading
    // TODO: ipcService.unlockVault(masterPassword)
    this.status = VaultStatus.Unlocked
    return { id: '', name: '', credentials: [], createdAt: new Date(), updatedAt: new Date() }
  }

  lock(): void {
    this.status = VaultStatus.Locked
  }

  /**
   * Add a new credential to the vault.
   * Replace this stub with an IPC call to the main process.
   */
  async addCredential(_vaultId: string, _credential: NewCredential): Promise<Credential> {
    // TODO: ipcService.addCredential(vaultId, credential)
    throw new Error('Not implemented')
  }
}

export const vaultService = new VaultService()
