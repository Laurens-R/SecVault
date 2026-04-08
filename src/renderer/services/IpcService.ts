import type { VaultResult, VaultSaveArgs, AppSettings, RecentVault } from '../models'

/**
 * IpcService
 *
 * The single point of contact with the Electron main process via contextBridge.
 * Keeps all `window.electronAPI` calls in one place; the rest of the app
 * imports from this service rather than touching `window` directly.
 */
export class IpcService {
  getAppVersion(): Promise<string> {
    return window.electronAPI.getAppVersion()
  }

  minimizeWindow(): Promise<void> {
    return window.electronAPI.minimizeWindow()
  }

  maximizeWindow(): Promise<void> {
    return window.electronAPI.maximizeWindow()
  }

  closeWindow(): Promise<void> {
    return window.electronAPI.closeWindow()
  }

  isWindowMaximized(): Promise<boolean> {
    return window.electronAPI.isWindowMaximized()
  }

  selectVaultSavePath(): Promise<{ filePath: string } | null> {
    return window.electronAPI.selectVaultSavePath()
  }

  createVault(args: { filePath: string; password: string }): Promise<VaultResult> {
    return window.electronAPI.createVault(args)
  }

  selectVaultOpenPath(): Promise<{ filePath: string; name: string } | null> {
    return window.electronAPI.selectVaultOpenPath()
  }

  openVault(args: { filePath: string; password: string }): Promise<VaultResult> {
    return window.electronAPI.openVault(args)
  }

  saveVault(args: VaultSaveArgs): Promise<{ updatedAt: string }> {
    return window.electronAPI.saveVault(args)
  }

  getVaultDefaultDir(): Promise<string> {
    return window.electronAPI.getVaultDefaultDir()
  }

  getSettings(): Promise<AppSettings> {
    return window.electronAPI.getSettings()
  }

  setSettings(key: keyof AppSettings, value: boolean): Promise<void> {
    return window.electronAPI.setSettings(key, value)
  }

  getRecentVaults(): Promise<RecentVault[]> {
    return window.electronAPI.getRecentVaults()
  }

  addRecentVault(args: { filePath: string; name: string }): Promise<void> {
    return window.electronAPI.addRecentVault(args)
  }
}

export const ipcService = new IpcService()
