import { contextBridge, ipcRenderer } from 'electron';

/**
 * Expose a safe, typed API to the renderer via the `window.electronAPI` object.
 * Never expose ipcRenderer directly — use contextBridge for each channel explicitly.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:version'),
});
