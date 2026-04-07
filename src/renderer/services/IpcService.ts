/**
 * IpcService
 *
 * The single point of contact with the Electron main process via contextBridge.
 * Keeps all `window.electronAPI` calls in one place; the rest of the app
 * imports from this service rather than touching `window` directly.
 */
export class IpcService {
  async getAppVersion(): Promise<string> {
    return window.electronAPI.getAppVersion()
  }
}

export const ipcService = new IpcService()
