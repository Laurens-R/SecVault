import type { VaultResult } from '../models'

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

  getVaultDefaultDir(): Promise<string> {
    return window.electronAPI.getVaultDefaultDir()
  }
}

export const ipcService = new IpcService()
