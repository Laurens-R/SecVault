import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';
import fs from 'fs';
import { createCipheriv, createDecipheriv, randomBytes, randomUUID, scryptSync } from 'crypto';
import path from 'path';

function createWindow(): void {
  const mainWindow = new BrowserWindow({
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

const getVaultDir = (): string => path.join(app.getPath('documents'), 'SecVault');

// ------------------------------------------------------------------
// Vault encryption — AES-256-GCM with scrypt key derivation
// ------------------------------------------------------------------
const SCRYPT_N = 131072; // 2^17: ~128 MB RAM per derivation — brute-force resistant
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 32;      // 256-bit key for AES-256
const SALT_LEN = 32;     // 256-bit random salt per vault
const IV_LEN = 12;       // 96-bit nonce (GCM recommendation)

interface VaultCryptoMeta {
  kdf: 'scrypt';
  salt: string;
  N: number;
  r: number;
  p: number;
  cipher: 'aes-256-gcm';
  iv: string;
  authTag: string;
}

function encryptPayload(
  plaintext: string,
  password: string,
): { crypto: VaultCryptoMeta; payload: string } {
  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LEN);
  const key = scryptSync(password, salt, KEY_LEN, {
    N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P,
    maxmem: 256 * 1024 * 1024,
  });
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return {
    crypto: {
      kdf: 'scrypt',
      salt: salt.toString('hex'),
      N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P,
      cipher: 'aes-256-gcm',
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex'),
    },
    payload: encrypted.toString('hex'),
  };
}

function decryptPayload(payloadHex: string, meta: VaultCryptoMeta, password: string): string {
  const key = scryptSync(
    password,
    Buffer.from(meta.salt, 'hex'),
    KEY_LEN,
    { N: meta.N, r: meta.r, p: meta.p, maxmem: 256 * 1024 * 1024 },
  );
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(meta.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(meta.authTag, 'hex'));
  try {
    return Buffer.concat([
      decipher.update(Buffer.from(payloadHex, 'hex')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    throw new Error('Invalid password or corrupted vault file.');
  }
}

// ------------------------------------------------------------------
// Vault IPC handlers
// ------------------------------------------------------------------
ipcMain.handle('vault:getDefaultDir', () => getVaultDir());

ipcMain.handle('vault:selectSavePath', async () => {
  const vaultDir = getVaultDir();
  fs.mkdirSync(vaultDir, { recursive: true });
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: 'Create New Vault',
    defaultPath: path.join(vaultDir, 'My Vault.vault'),
    filters: [{ name: 'SecVault Files', extensions: ['vault'] }],
    properties: ['createDirectory'],
  });
  if (canceled || !filePath) return null;
  return { filePath };
});

ipcMain.handle('vault:create', (_event, args: { filePath: string; password: string }) => {
  const { filePath, password } = args;
  const name = path.basename(filePath, '.vault');
  const now = new Date().toISOString();
  const sensitivePayload = JSON.stringify({ credentials: [], updatedAt: now });
  const { crypto: cryptoMeta, payload } = encryptPayload(sensitivePayload, password);
  const fileData = {
    format: 'secvault-encrypted',
    version: '1.0',
    id: randomUUID(),
    name,
    createdAt: now,
    crypto: cryptoMeta,
    payload,
  };
  // 0o600: owner read/write only
  fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), { encoding: 'utf-8', mode: 0o600 });
  return { filePath, id: fileData.id, name, createdAt: now, updatedAt: now, credentials: [] };
});

ipcMain.handle('vault:selectOpenPath', async () => {
  const vaultDir = getVaultDir();
  const { filePaths, canceled } = await dialog.showOpenDialog({
    title: 'Open Vault',
    defaultPath: vaultDir,
    filters: [{ name: 'SecVault Files', extensions: ['vault'] }],
    properties: ['openFile'],
  });
  if (canceled || filePaths.length === 0) return null;
  const filePath = filePaths[0];
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
  } catch {
    throw new Error('The selected file is not a valid vault file.');
  }
  if (parsed['format'] !== 'secvault-encrypted' || typeof parsed['name'] !== 'string') {
    throw new Error('The selected file is not a valid SecVault file.');
  }
  return { filePath, name: parsed['name'] as string };
});

ipcMain.handle('vault:open', (_event, args: { filePath: string; password: string }) => {
  const { filePath, password } = args;
  let fileData: Record<string, unknown>;
  try {
    fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
  } catch {
    throw new Error('The vault file could not be read.');
  }
  if (fileData['format'] !== 'secvault-encrypted') {
    throw new Error('Invalid vault format. This file was not created by SecVault.');
  }
  const cryptoMeta = fileData['crypto'] as VaultCryptoMeta;
  // Throws 'Invalid password or corrupted vault file.' on auth-tag mismatch
  const plaintext = decryptPayload(fileData['payload'] as string, cryptoMeta, password);
  const sensitive = JSON.parse(plaintext) as { credentials: unknown[]; updatedAt: string };
  return {
    filePath,
    id: fileData['id'] as string,
    name: fileData['name'] as string,
    createdAt: fileData['createdAt'] as string,
    updatedAt: sensitive.updatedAt,
    credentials: sensitive.credentials,
  };
});

// ------------------------------------------------------------------
// App lifecycle
// ------------------------------------------------------------------
app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
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
