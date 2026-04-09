export type AppTheme = 'dark' | 'light' | 'system'

export interface AppSettings {
  openAtLogin: boolean
  minimizeToTray: boolean
  theme: AppTheme
}

export const DEFAULT_SETTINGS: AppSettings = {
  openAtLogin: false,
  minimizeToTray: false,
  theme: 'dark',
}
