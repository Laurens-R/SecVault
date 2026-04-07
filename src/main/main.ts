import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,   // Isolate context for security
      nodeIntegration: false,   // Disable direct Node access in renderer
      sandbox: true,            // Enable renderer sandboxing
    },
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

// ------------------------------------------------------------------
// IPC handlers
// ------------------------------------------------------------------
ipcMain.handle('app:version', () => app.getVersion());

// ------------------------------------------------------------------
// App lifecycle
// ------------------------------------------------------------------
app.whenReady().then(() => {
  createWindow();

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
