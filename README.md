# SecVault

A secure, local-first password manager and secret vault built with **Electron**, **React**, and **TypeScript**. All data is stored entirely on your device — no cloud, no accounts, no telemetry.

---

## Features

### Vault management
- Create and open encrypted `.secvault` files stored anywhere on disk
- Master password protection with scrypt key derivation (N=2¹⁷, 128 MB RAM cost) and AES-256-GCM authenticated encryption
- Recent vaults list on the home screen for quick access
- Lock vault at any time from the header or system tray

### Secret types
Each vault contains one or more named **sub-vaults**, each holding a specific type of secret:

| Type | Fields |
|------|--------|
| **Credentials** | Label, username/email, password, URL, notes |
| **Secure Notes** | Title, free-text content |
| **Software Licenses** | Product name, license key, registered to, email, purchase/expiry dates, notes |
| **Contacts** | Name, email, phone, company, address, notes |
| **Bank Accounts** | Bank accounts (account number, routing number, PIN) and credit cards (card number, expiry, CVV, PIN) |

### Password tools
- Built-in **password generator** with two modes:
  - **Password** — configurable length, character sets (uppercase, lowercase, digits, symbols), exclude ambiguous characters
  - **Passphrase** — word count, separator, capitalisation, optional number inclusion
- Cryptographically secure generation (rejection-sampling, no modulo bias)
- Password strength indicator
- One-click copy from the generator or from any credential field

### UI & experience
- Dark, Light, and System (auto) themes
- Inter font with four weights for polished typography
- Reveal/hide toggle on password fields
- Copy-to-clipboard on all sensitive fields with a 2-second confirmation flash
- Inline search/filter within each sub-vault list
- Save-status indicator (Saving → Saved / Error) with auto-dismiss

### System integration
- Minimize to system tray — keeps running in the background
- Open at login (Windows auto-start)
- Custom tray icon with Show / Lock / Quit context menu

---

## Security model

| Layer | Implementation |
|-------|---------------|
| Key derivation | scrypt (N=131072, r=8, p=1) — ~128 MB RAM, brute-force resistant |
| Encryption | AES-256-GCM — authenticated encryption, detects tampering |
| Salt & IV | 256-bit random salt + 96-bit random nonce, unique per save |
| Renderer isolation | `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false` |
| IPC surface | Minimal allow-list via `contextBridge` in `preload.ts` |
| Content Security Policy | Strict CSP enforced via `webRequest.onHeadersReceived` |
| Local only | No network requests, no telemetry, no cloud sync |

Vault files use a plaintext JSON header (format version, vault name, creation date, crypto parameters) with the entire secret payload as hex-encoded AES-256-GCM ciphertext. Without the master password the payload is unreadable.

---

## Getting started

**Requirements:** Node.js 18+, npm 9+

```bash
# Install dependencies
npm install

# Start the app with hot-module reload
npm run dev

# Type-check without building
npx tsc --noEmit

# Production build → out/
npm run build

# Build + package installer → release/
npm run package
```

---

## Project structure

```
src/
  main/
    main.ts              # BrowserWindow, app lifecycle, CSP
    crypto.ts            # scrypt + AES-256-GCM encrypt/decrypt
    vaultHandlers.ts     # Vault open/save/recent IPC handlers
    settingsHandlers.ts  # Settings IPC handlers
    settings.ts          # Settings read/write (userData/settings.json)
    tray.ts              # System tray icon and menu
    window.ts            # BrowserWindow factory
  preload/
    preload.ts           # contextBridge — only IPC surface exposed to renderer
  renderer/
    components/          # Reusable UI components (Button, Select, TitleBar, PasswordGenerator, PasswordModal)
    hooks/               # Custom React hooks (useSettings, useVaultActions, useVaultPage, …)
    models/              # TypeScript interfaces and types for all domain entities
    pages/               # HomePage, VaultPage, SettingsPage
    services/            # IpcService (wraps window.electronAPI), VaultService, SettingsService
    styles/              # Global SCSS tokens and reset
    utils/               # Password generator, UUID, wordlist
```

---

## License

MIT
