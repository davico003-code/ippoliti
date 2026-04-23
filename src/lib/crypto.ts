import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'node:crypto'

/**
 * Encriptación simétrica AES-256-GCM para credenciales sensibles
 * (tokens de Meta, Mercado Libre, ManyChat, etc).
 *
 * Formato del ciphertext almacenado (base64 de la concatenación):
 *   [12 bytes IV][16 bytes AuthTag][N bytes ciphertext]
 *
 * Requisitos:
 *   - ENCRYPTION_KEY en env (Vercel + .env.local).
 *   - Generar con: openssl rand -base64 32
 *   - Debe ser exactamente 32 bytes al decodificar base64. Si no, throw inmediato.
 *
 * Uso:
 *   import { encrypt, decrypt } from '@/lib/crypto'
 *   const stored = encrypt('mi-token-secreto')
 *   const plain = decrypt(stored)
 *
 *   // Override de key (rotación, tests):
 *   const stored2 = encrypt('mi-token', miKeyAlternativa)
 */

const ALGO = 'aes-256-gcm'
const IV_LENGTH = 12 // 96 bits, recomendado para GCM
const AUTH_TAG_LENGTH = 16 // 128 bits
const KEY_LENGTH = 32 // 256 bits

type KeyInput = Buffer | string

const KEY_ERROR =
  'ENCRYPTION_KEY inválida: debe ser base64 de 32 bytes. Generá con: openssl rand -base64 32'

/**
 * Resuelve la key a usar. Si se pasa `key` explícito, lo usa; si no,
 * lee `process.env.ENCRYPTION_KEY`. En ambos casos exige exactamente 32 bytes.
 *
 * Throws inmediato si la key falta o tiene longitud incorrecta — fail fast,
 * fail obvio, sin fallbacks silenciosos que oculten errores de config.
 */
function resolveKey(key?: KeyInput): Buffer {
  let raw: KeyInput | undefined = key
  if (raw == null) {
    raw = process.env.ENCRYPTION_KEY
  }
  if (raw == null || raw === '') {
    throw new Error(
      'ENCRYPTION_KEY no está definida. Generala con: openssl rand -base64 32',
    )
  }

  if (Buffer.isBuffer(raw)) {
    if (raw.length !== KEY_LENGTH) throw new Error(KEY_ERROR)
    return raw
  }

  // String: debe base64-decodear a exactamente 32 bytes
  const decoded = Buffer.from(raw, 'base64')
  if (decoded.length !== KEY_LENGTH) throw new Error(KEY_ERROR)
  return decoded
}

/**
 * Encripta un string plano y devuelve el ciphertext en base64.
 * Devolvé `null` si la entrada es null/undefined (útil para columnas nullable).
 * Devuelve `''` si la entrada es '' (no se encripta vacío).
 *
 * @param plaintext  Texto a encriptar.
 * @param key        Opcional. Si no se pasa, usa `process.env.ENCRYPTION_KEY`.
 */
export function encrypt(
  plaintext: string | null | undefined,
  key?: KeyInput,
): string | null {
  if (plaintext == null) return null
  if (plaintext === '') return ''

  const k = resolveKey(key)
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGO, k, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  // [IV | AuthTag | Ciphertext]
  return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

/**
 * Desencripta un ciphertext (base64) y devuelve el string plano.
 * Devolvé `null` si la entrada es null/undefined/vacía.
 * Lanza error si el ciphertext es inválido o la key cambió.
 *
 * @param ciphertext  Ciphertext base64 producido por `encrypt`.
 * @param key         Opcional. Si no se pasa, usa `process.env.ENCRYPTION_KEY`.
 */
export function decrypt(
  ciphertext: string | null | undefined,
  key?: KeyInput,
): string | null {
  if (ciphertext == null || ciphertext === '') return null

  const k = resolveKey(key)
  const data = Buffer.from(ciphertext, 'base64')

  if (data.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Ciphertext corrupto o formato inválido.')
  }

  const iv = data.subarray(0, IV_LENGTH)
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const encrypted = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

  const decipher = createDecipheriv(ALGO, k, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ])

  return decrypted.toString('utf8')
}

/**
 * Helper para rotar la key: desencripta con la key vieja y re-encripta con la nueva.
 * Pasa las keys explícitas, **sin tocar `process.env`** — seguro bajo concurrencia.
 *
 * Corré esto en una migración si alguna vez rotás ENCRYPTION_KEY.
 */
export function rotate(
  ciphertext: string,
  oldKey: KeyInput,
  newKey: KeyInput,
): string {
  const plain = decrypt(ciphertext, oldKey)
  if (plain == null) {
    throw new Error('No se pudo desencriptar con oldKey (¿ciphertext o key incorrectos?).')
  }
  const reencrypted = encrypt(plain, newKey)
  if (reencrypted == null) {
    throw new Error('No se pudo reencriptar con newKey.')
  }
  return reencrypted
}
