import type { VaultResult } from '../models'

export {}

declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>
      minimizeWindow: () => Promise<void>
      maximizeWindow: () => Promise<void>
      closeWindow: () => Promise<void>
      isWindowMaximized: () => Promise<boolean>
      selectVaultSavePath: () => Promise<{ filePath: string } | null>
      createVault: (args: { filePath: string; password: string }) => Promise<VaultResult>
      selectVaultOpenPath: () => Promise<{ filePath: string; name: string } | null>
      openVault: (args: { filePath: string; password: string }) => Promise<VaultResult>
      getVaultDefaultDir: () => Promise<string>
    }
  }
}
