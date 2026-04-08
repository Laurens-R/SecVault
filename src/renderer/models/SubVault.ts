import type { Credential } from './Credential'
import type { Note } from './Note'
import type { SoftwareLicense } from './SoftwareLicense'
import type { Contact } from './Contact'
import type { BankAccount } from './BankAccount'

export type SubVaultType = 'credentials' | 'notes' | 'licenses' | 'contacts' | 'bank'

interface SubVaultBase {
  id: string
  name: string
  type: SubVaultType
}

export interface CredentialSubVault extends SubVaultBase {
  type: 'credentials'
  credentials: Credential[]
}

export interface NoteSubVault extends SubVaultBase {
  type: 'notes'
  items: Note[]
}

export interface LicenseSubVault extends SubVaultBase {
  type: 'licenses'
  items: SoftwareLicense[]
}

export interface ContactSubVault extends SubVaultBase {
  type: 'contacts'
  items: Contact[]
}

export interface BankSubVault extends SubVaultBase {
  type: 'bank'
  items: BankAccount[]
}

export type SubVault =
  | CredentialSubVault
  | NoteSubVault
  | LicenseSubVault
  | ContactSubVault
  | BankSubVault

export type SubVaultItem = Credential | Note | SoftwareLicense | Contact | BankAccount

export function getSubVaultItemCount(sv: SubVault): number {
  return sv.type === 'credentials' ? sv.credentials.length : sv.items.length
}

export const DEFAULT_SUBVAULT_NAME = 'Credentials'
