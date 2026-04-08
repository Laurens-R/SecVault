export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  address?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type NewContact = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>
