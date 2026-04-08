export interface SoftwareLicense {
  id: string
  productName: string
  licenseKey: string
  registeredTo?: string
  email?: string
  purchaseDate?: string
  expiresAt?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type NewSoftwareLicense = Omit<SoftwareLicense, 'id' | 'createdAt' | 'updatedAt'>
