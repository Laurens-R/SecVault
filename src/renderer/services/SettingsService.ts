import type { AppSettings } from '../models'
import { ipcService } from './IpcService'

export class SettingsService {
  get(): Promise<AppSettings> {
    return ipcService.getSettings()
  }

  set(key: keyof AppSettings, value: boolean | string): Promise<void> {
    return ipcService.setSettings(key, value)
  }
}

export const settingsService = new SettingsService()
