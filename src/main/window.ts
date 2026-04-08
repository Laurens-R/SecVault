import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { getSettings } from './settings';

let mainWindowRef: BrowserWindow | null = null;

export function getMainWindow(): BrowserWindow | null {
  return mainWindowRef;
}

export function createWindow(): void {
  mainWindowRef = new BrowserWindow({
    width: 1024,
    height: 768,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,   // Isolate context for security
      nodeIntegration: false,   // Disable direct Node access in renderer
      sandbox: true,            // Enable renderer sandboxing
    },
  });
  const mainWindow = mainWindowRef;

  mainWindow.on('minimize', () => {
    if (getSettings().minimizeToTray) {
      mainWindow.hide();
    }
  });

  // Content Security Policy — strict in production, permissive for Vite HMR in dev
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const csp = app.isPackaged
      ? "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none';"
      : "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* ws://localhost:*";
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp],
      },
    });
  });

  // Dev: load from Vite dev server; prod: load compiled HTML
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

export function registerWindowHandlers(): void {
  ipcMain.handle('app:version', () => app.getVersion());

  ipcMain.handle('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });

  ipcMain.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.handle('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
  });

  ipcMain.handle('window:isMaximized', (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false;
  });
}
