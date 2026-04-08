/** Browser-safe UUID v4 — uses the Web Crypto API, available in Electron's renderer. */
export function randomUUID(): string {
  return crypto.randomUUID()
}
