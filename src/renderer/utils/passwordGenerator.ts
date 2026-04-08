import { WORDLIST } from './wordlist'

export type PasswordMode = 'password' | 'passphrase'

export interface PasswordOptions {
  mode: PasswordMode
  // Password mode
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  symbolSet: string
  excludeAmbiguous: boolean
  // Passphrase mode
  wordCount: number
  separator: string
  capitalizeWords: boolean
  includeNumber: boolean
}

export const DEFAULT_OPTIONS: PasswordOptions = {
  mode: 'password',
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  symbolSet: '!@#$%^&*-_=+?.,:',
  excludeAmbiguous: false,
  wordCount: 5,
  separator: '-',
  capitalizeWords: true,
  includeNumber: false,
}

const AMBIGUOUS = new Set('0O1lI')
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'

/**
 * Cryptographically secure unbiased random integer in [0, max).
 * Uses rejection sampling to eliminate modulo bias.
 */
function secureRandom(max: number): number {
  if (max <= 1) return 0
  // Largest multiple of max that fits in uint32
  const limit = 0x100000000 - (0x100000000 % max)
  const buf = new Uint32Array(1)
  let n: number
  do {
    crypto.getRandomValues(buf)
    n = buf[0]
  } while (n >= limit)
  return n % max
}

/** Secure Fisher-Yates shuffle in place. */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function filterAmbiguous(str: string): string {
  return str.split('').filter(c => !AMBIGUOUS.has(c)).join('')
}

export function generatePassword(opts: PasswordOptions): string {
  const upper  = opts.excludeAmbiguous ? filterAmbiguous(UPPER)  : UPPER
  const lower  = opts.excludeAmbiguous ? filterAmbiguous(LOWER)  : LOWER
  const digits = opts.excludeAmbiguous ? filterAmbiguous(DIGITS) : DIGITS
  const syms   = opts.symbolSet.split('').filter(c => !AMBIGUOUS.has(c)).join('')

  let pool = ''
  if (opts.uppercase && upper.length  > 0) pool += upper
  if (opts.lowercase && lower.length  > 0) pool += lower
  if (opts.numbers   && digits.length > 0) pool += digits
  if (opts.symbols   && syms.length   > 0) pool += syms

  if (pool.length === 0) return ''

  // Guarantee at least one character from each required class
  const required: string[] = []
  if (opts.uppercase && upper.length  > 0) required.push(upper [secureRandom(upper.length)])
  if (opts.lowercase && lower.length  > 0) required.push(lower [secureRandom(lower.length)])
  if (opts.numbers   && digits.length > 0) required.push(digits[secureRandom(digits.length)])
  if (opts.symbols   && syms.length   > 0) required.push(syms  [secureRandom(syms.length)])

  const length = Math.max(opts.length, required.length)
  const chars: string[] = [...required]
  while (chars.length < length) {
    chars.push(pool[secureRandom(pool.length)])
  }

  return shuffle(chars).join('')
}

export function generatePassphrase(opts: PasswordOptions): string {
  const words: string[] = Array.from({ length: opts.wordCount }, () => {
    let word = WORDLIST[secureRandom(WORDLIST.length)] as string
    if (opts.capitalizeWords) word = word.charAt(0).toUpperCase() + word.slice(1)
    return word
  })

  if (opts.includeNumber) {
    const num = String(secureRandom(100))
    words.splice(secureRandom(words.length + 1), 0, num)
  }

  return words.join(opts.separator)
}

export function generate(opts: PasswordOptions): string {
  return opts.mode === 'passphrase' ? generatePassphrase(opts) : generatePassword(opts)
}

export function calcEntropy(opts: PasswordOptions): number {
  if (opts.mode === 'passphrase') {
    const bits = (opts.wordCount + (opts.includeNumber ? 1 : 0)) * Math.log2(WORDLIST.length)
    // Number adds log2(100) ≈ 6.6 bits
    return bits + (opts.includeNumber ? Math.log2(100) - Math.log2(WORDLIST.length) : 0)
  }

  const upper  = opts.excludeAmbiguous ? filterAmbiguous(UPPER).length  : UPPER.length
  const lower  = opts.excludeAmbiguous ? filterAmbiguous(LOWER).length  : LOWER.length
  const digits = opts.excludeAmbiguous ? filterAmbiguous(DIGITS).length : DIGITS.length
  const syms   = opts.symbolSet.split('').filter(c => !AMBIGUOUS.has(c)).length

  let poolSize = 0
  if (opts.uppercase) poolSize += upper
  if (opts.lowercase) poolSize += lower
  if (opts.numbers)   poolSize += digits
  if (opts.symbols)   poolSize += syms

  if (poolSize === 0) return 0
  return opts.length * Math.log2(poolSize)
}
