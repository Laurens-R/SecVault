import type { Credential } from './Credential'

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
