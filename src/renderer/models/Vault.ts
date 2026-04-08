import type { Credential } from './Credential'
import type { SubVault } from './SubVault'

export interface Vault {
  id: string
  name: string
  credentials: Credential[]
  createdAt: Date
  updatedAt: Date
}

export enum VaultStatus {
  Locked = 'locked',
  Unlocked = 'unlocked',
  Loading = 'loading',
}

/** Crypto metadata stored unencrypted in the vault file header. */
export interface VaultCryptoMeta {
  kdf: 'scrypt'
  salt: string      // hex
  N: number
  r: number
  p: number
  cipher: 'aes-256-gcm'
  iv: string        // hex
  authTag: string   // hex
}

/**
 * On-disk vault file format.
 * Only id/name/createdAt/crypto are plaintext; `payload` is AES-256-GCM ciphertext.
 */
export interface VaultFileData {
  format: 'secvault-encrypted'
  version: string
  id: string
  name: string
  createdAt: string
  crypto: VaultCryptoMeta
  payload: string   // hex-encoded ciphertext
}

/** Returned to the renderer after successful vault decryption. */
export interface VaultResult {
  filePath: string
  id: string
  name: string
  createdAt: string
  updatedAt: string
  credentials: Credential[]
  subVaults?: SubVault[]
}

/** Arguments for re-encrypting and saving an open vault. */
export interface VaultSaveArgs {
  filePath: string
  password: string
  vaultId: string
  vaultName: string
  createdAt: string
  subVaults: SubVault[]
}
