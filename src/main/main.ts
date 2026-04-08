import { app, BrowserWindow, Menu } from 'electron';
import { loadSettings } from './settings';
import { createWindow, registerWindowHandlers } from './window';
import { setupTray } from './tray';
import { registerVaultHandlers } from './vaultHandlers';
import { registerSettingsHandlers } from './settingsHandlers';

// Register all IPC handlers at startup, before any window is created.
registerWindowHandlers();
registerVaultHandlers();
registerSettingsHandlers();

app.whenReady().then(() => {
  loadSettings();
  Menu.setApplicationMenu(null);
  createWindow();
  setupTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
