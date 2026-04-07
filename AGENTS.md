# SecVault — Agent Guidelines

## Functional description

This app is a secure vault application to store passwords, secret information, license keys, etc.

## Architecture

Electron app with three isolated processes:

| Process | Entry point | Language |
|---------|-------------|----------|
| **Main** | `src/main/main.ts` | TypeScript (Node.js) |
| **Preload** | `src/preload/preload.ts` | TypeScript (Node.js, sandboxed) |
| **Renderer** | `src/renderer/main.tsx` | TypeScript + React + SCSS |

The main and preload processes are compiled by electron-vite targeting Node/CommonJS.
The renderer is compiled by Vite with `@vitejs/plugin-react` targeting the browser.

## Project Structure

```
src/
  main/
    main.ts              # BrowserWindow creation, IPC handlers, app lifecycle
  preload/
    preload.ts           # contextBridge — the ONLY place main↔renderer IPC is exposed
  renderer/
    main.tsx             # React root (StrictMode + createRoot)
    App.tsx              # Root component — delegates to a page
    index.html           # Vite HTML entry
    components/
      common/
        Button/          # Each component: ComponentName.tsx + .module.scss + index.ts
      index.ts           # Barrel — add new component folders here
    hooks/
      useAppVersion.ts   # Custom hooks consume services, never window.electronAPI directly
      index.ts
    models/
      Credential.ts      # Domain interfaces and types
      Vault.ts           # Domain interfaces and enums
      index.ts
    pages/
      HomePage/          # Each page: PageName.tsx + .module.scss + index.ts
      index.ts
    services/
      IpcService.ts      # Wraps ALL window.electronAPI calls — single point of contact
      VaultService.ts    # Domain business logic; delegates persistence to IpcService
      index.ts
    styles/
      _variables.scss    # SCSS design tokens ($color-*, $font-size-*)
      globals.scss       # Global reset and body styles (imported once in main.tsx)
    types/
      electron.d.ts      # Window.electronAPI type augmentation
```

## Build and Dev

```bash
npm install          # Install dependencies
npm run dev          # Start electron-vite dev server with HMR
npm run build        # Production build → out/
npm run package      # Build + package with electron-builder → release/
```

## Key Conventions

**IPC (Inter-Process Communication)**
- Add new IPC channels in two places: `src/main/main.ts` (handler) and `src/preload/preload.ts` (bridge).
- Extend the `Window.electronAPI` interface in `src/renderer/types/electron.d.ts`.
- Never call `window.electronAPI` outside `IpcService`.

**Components**
- Every component lives in its own folder: `components/<category>/<Name>/`.
- Always co-locate a CSS Module (`Name.module.scss`) with the component file.
- Export the component via an `index.ts` barrel in the same folder and register it in the category barrel (`components/<category>/index.ts`).

**SCSS**
- Design tokens live exclusively in `styles/_variables.scss` — use `@use '../styles/variables' as *` to import.
- Global styles belong in `styles/globals.scss`, imported once at `main.tsx`.
- Component styles use CSS Modules (`.module.scss`) — no global class names.

**Services**
- Services are TypeScript classes with a singleton instance exported (`export const fooService = new FooService()`).
- All business logic for a domain goes in the corresponding service (e.g. `VaultService`).
- Services are consumed by hooks; hooks are consumed by components/pages.

**Models**
- Interfaces describe data shapes; enums describe finite states.
- `Omit<T, ...>` utility types (e.g. `NewCredential`) are defined alongside their base type.
- Never import models from a deep path — always import via the barrel: `import type { Credential } from '../models'`.

**Security**
- `contextIsolation: true` and `sandbox: true` are required on every `BrowserWindow` — do not disable them.
- `nodeIntegration` must remain `false` in the renderer.
- CSP is enforced via `webRequest.onHeadersReceived` in `main.ts` — strict in production, relaxed only for Vite HMR in dev.

## Coding standards
- Always try to create logical React subcomponents where it makes sense
- Always try to reuse existing components unless there is a real need for a new one
- Always try to follow established design standards from other components.
- Try to centralize and reuse styling as much as possible.
