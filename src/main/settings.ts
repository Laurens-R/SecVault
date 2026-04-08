import { app } from 'electron';
import fs from 'fs';
import path from 'path';

export interface AppSettings {
  openAtLogin: boolean;
  minimizeToTray: boolean;
}

const DEFAULT_SETTINGS: AppSettings = { openAtLogin: false, minimizeToTray: false };

// Mutable in-place — callers holding a reference see updates immediately.
const state: AppSettings = { ...DEFAULT_SETTINGS };
let settingsFilePath = '';

export function getSettings(): AppSettings {
  return state;
}

export function updateSettings(key: keyof AppSettings, value: boolean): void {
  state[key] = value;
}

export function loadSettings(): void {
  settingsFilePath = path.join(app.getPath('userData'), 'settings.json');
  try {
    const raw = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8')) as Partial<AppSettings>;
    Object.assign(state, DEFAULT_SETTINGS, raw);
  } catch {
    Object.assign(state, DEFAULT_SETTINGS);
  }
  // Sync openAtLogin from the OS — it is the source of truth.
  state.openAtLogin = app.getLoginItemSettings().openAtLogin;
}

export function persistSettings(): void {
  try {
    fs.writeFileSync(settingsFilePath, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to persist settings:', e);
  }
}
