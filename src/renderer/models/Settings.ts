export interface AppSettings {
  openAtLogin: boolean
  minimizeToTray: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
  openAtLogin: false,
  minimizeToTray: false,
}
