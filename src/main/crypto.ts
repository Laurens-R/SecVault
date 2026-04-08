import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const SCRYPT_N = 131072; // 2^17: ~128 MB RAM per derivation — brute-force resistant
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 32;  // 256-bit key for AES-256
const SALT_LEN = 32; // 256-bit random salt per vault
const IV_LEN = 12;   // 96-bit nonce (GCM recommendation)

export interface VaultCryptoMeta {
  kdf: 'scrypt';
  salt: string;
  N: number;
  r: number;
  p: number;
  cipher: 'aes-256-gcm';
  iv: string;
  authTag: string;
}

export function encryptPayload(
  plaintext: string,
  password: string,
): { crypto: VaultCryptoMeta; payload: string } {
  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LEN);
  const key = scryptSync(password, salt, KEY_LEN, {
    N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P,
    maxmem: 256 * 1024 * 1024,
  });
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return {
    crypto: {
      kdf: 'scrypt',
      salt: salt.toString('hex'),
      N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P,
      cipher: 'aes-256-gcm',
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex'),
    },
    payload: encrypted.toString('hex'),
  };
}

export function decryptPayload(payloadHex: string, meta: VaultCryptoMeta, password: string): string {
  const key = scryptSync(
    password,
    Buffer.from(meta.salt, 'hex'),
    KEY_LEN,
    { N: meta.N, r: meta.r, p: meta.p, maxmem: 256 * 1024 * 1024 },
  );
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(meta.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(meta.authTag, 'hex'));
  try {
    return Buffer.concat([
      decipher.update(Buffer.from(payloadHex, 'hex')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    throw new Error('Invalid password or corrupted vault file.');
  }
}
