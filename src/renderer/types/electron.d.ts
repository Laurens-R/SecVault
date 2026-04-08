import type { VaultResult, VaultSaveArgs, AppSettings } from '../models'

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
      saveVault: (args: VaultSaveArgs) => Promise<{ updatedAt: string }>
      getVaultDefaultDir: () => Promise<string>
      getSettings: () => Promise<AppSettings>
      setSettings: (key: string, value: boolean) => Promise<void>
    }
  }
}
