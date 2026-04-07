export interface Credential {
  id: string
  label: string
  username: string
  /** Stored as encrypted ciphertext; never plaintext in memory beyond the active session. */
  encryptedPassword: string
  url?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type NewCredential = Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>
