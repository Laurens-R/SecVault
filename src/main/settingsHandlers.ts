import { app, ipcMain } from 'electron';
import { getSettings, updateSettings, persistSettings, type AppSettings } from './settings';

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', () => ({ ...getSettings() }));

  ipcMain.handle('settings:set', (_event, key: string, value: boolean) => {
    updateSettings(key as keyof AppSettings, value);
    persistSettings();
    if (key === 'openAtLogin') {
      app.setLoginItemSettings({ openAtLogin: value });
    }
  });
}
