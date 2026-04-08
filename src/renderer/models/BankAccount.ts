export type BankAccountType = 'bank' | 'credit-card'

export interface BankAccount {
  id: string
  accountType: BankAccountType
  label: string
  bankName?: string
  /** Bank: account number. */
  accountNumber?: string
  /** Bank: routing / sort code. */
  routingNumber?: string
  /** Credit card: card number. */
  cardNumber?: string
  /** Credit card: MM/YY expiry. */
  expiryDate?: string
  /** Credit card: CVV/CVC. */
  cvv?: string
  /** Shared: PIN. */
  pin?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type NewBankAccount = Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>
