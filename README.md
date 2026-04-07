# SecVault

Secure Vault Application — built with **Electron** + **TypeScript**.

## Project structure

```
src/
  main/       → Electron main process (Node.js)
  preload/    → Context-bridge preload script
  renderer/   → UI (HTML, CSS, TypeScript)
dist/         → Compiled JavaScript output (git-ignored)
```

## Getting started

```bash
# Install dependencies
npm install

# Build TypeScript and launch the app
npm start

# Build only
npm run build

# Package for distribution
npm run package
```

## Security

- `contextIsolation` and renderer sandboxing are enabled by default.
- `nodeIntegration` is disabled in the renderer.
- All IPC channels are explicitly declared in `src/preload/preload.ts` via `contextBridge`.
- A strict Content Security Policy is enforced in `index.html`.
