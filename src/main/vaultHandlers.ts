import { app, dialog, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { encryptPayload, decryptPayload, type VaultCryptoMeta } from './crypto';

const getVaultDir = (): string => path.join(app.getPath('documents'), 'SecVault');

// ---------------------------------------------------------------------------
// Recent vaults helpers
// ---------------------------------------------------------------------------
interface RecentVaultEntry { filePath: string; name: string; openedAt: string }
const RECENT_VAULTS_MAX = 5;

function getRecentVaultsPath(): string {
  return path.join(app.getPath('userData'), 'recent-vaults.json');
}

function readRecentVaults(): RecentVaultEntry[] {
  try {
    return JSON.parse(fs.readFileSync(getRecentVaultsPath(), 'utf-8')) as RecentVaultEntry[];
  } catch {
    return [];
  }
}

function writeRecentVaults(entries: RecentVaultEntry[]): void {
  try {
    fs.writeFileSync(getRecentVaultsPath(), JSON.stringify(entries, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to persist recent vaults:', e);
  }
}

export function recordRecentVault(filePath: string, name: string): void {
  const entries = readRecentVaults().filter(e => e.filePath !== filePath);
  entries.unshift({ filePath, name, openedAt: new Date().toISOString() });
  writeRecentVaults(entries.slice(0, RECENT_VAULTS_MAX));
}

export function registerVaultHandlers(): void {
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
    const sensitive = JSON.parse(plaintext) as {
      credentials?: unknown[];
      subVaults?: unknown[];
      updatedAt: string;
    };
    return {
      filePath,
      id: fileData['id'] as string,
      name: fileData['name'] as string,
      createdAt: fileData['createdAt'] as string,
      updatedAt: sensitive.updatedAt,
      credentials: (sensitive.subVaults ? [] : (sensitive.credentials ?? [])) as unknown[],
      subVaults: sensitive.subVaults ?? null,
    };
  });

  ipcMain.handle('vault:save', (_event, args: {
    filePath: string;
    password: string;
    vaultId: string;
    vaultName: string;
    createdAt: string;
    subVaults: unknown[];
  }) => {
    const { filePath, password, vaultId, vaultName, createdAt, subVaults } = args;
    const now = new Date().toISOString();
    const sensitivePayload = JSON.stringify({ subVaults, updatedAt: now });
    const { crypto: cryptoMeta, payload } = encryptPayload(sensitivePayload, password);
    const fileData = {
      format: 'secvault-encrypted',
      version: '1.1',
      id: vaultId,
      name: vaultName,
      createdAt,
      crypto: cryptoMeta,
      payload,
    };
    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), { encoding: 'utf-8', mode: 0o600 });
    return { updatedAt: now };
  });

  ipcMain.handle('vault:getRecentVaults', () => readRecentVaults());

  ipcMain.handle('vault:addRecentVault', (_event, args: { filePath: string; name: string }) => {
    recordRecentVault(args.filePath, args.name);
  });
}
