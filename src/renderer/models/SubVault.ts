import type { Credential } from './Credential'

export interface SubVault {
  id: string
  name: string
  credentials: Credential[]
}

export const DEFAULT_SUBVAULT_NAME = 'Credentials'
