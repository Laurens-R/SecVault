import { contextBridge, ipcRenderer } from 'electron';

/**
 * Expose a safe, typed API to the renderer via the `window.electronAPI` object.
 * Never expose ipcRenderer directly — use contextBridge for each channel explicitly.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:version'),
  minimizeWindow: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: (): Promise<void> => ipcRenderer.invoke('window:maximize'),
  closeWindow: (): Promise<void> => ipcRenderer.invoke('window:close'),
  isWindowMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized'),
  selectVaultSavePath: () => ipcRenderer.invoke('vault:selectSavePath'),
  createVault: (args: { filePath: string; password: string }) => ipcRenderer.invoke('vault:create', args),
  selectVaultOpenPath: () => ipcRenderer.invoke('vault:selectOpenPath'),
  openVault: (args: { filePath: string; password: string }) => ipcRenderer.invoke('vault:open', args),
  getVaultDefaultDir: (): Promise<string> => ipcRenderer.invoke('vault:getDefaultDir'),
});
