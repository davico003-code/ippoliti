// Tests para src/lib/crypto.ts
// Run con: node --test src/lib/crypto.test.ts
//
// Node 22+ soporta TS nativo (strip types). En Node 24 funciona sin flag.

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { encrypt, decrypt, rotate } from './crypto.ts'

// Helpers ──────────────────────────────────────────────────────────────────

function makeKey(): string {
  // 32 bytes random codificados en base64 (igual que `openssl rand -base64 32`)
  return randomBytes(32).toString('base64')
}

const KEY_A = makeKey()
const KEY_B = makeKey()

describe('crypto: roundtrip', () => {
  it('encrypt → decrypt devuelve el plaintext original (key explícita)', () => {
    const plain = 'Mi token super secreto · áéíóú · 🚀'
    const ct = encrypt(plain, KEY_A)
    assert.ok(ct, 'ciphertext no debe ser null')
    assert.equal(decrypt(ct, KEY_A), plain)
  })

  it('encrypt produce ciphertext distinto cada vez (IV random)', () => {
    const plain = 'mismo input'
    const ct1 = encrypt(plain, KEY_A)
    const ct2 = encrypt(plain, KEY_A)
    assert.notEqual(ct1, ct2, 'dos encripciones del mismo plaintext deben diferir por el IV')
    assert.equal(decrypt(ct1, KEY_A), plain)
    assert.equal(decrypt(ct2, KEY_A), plain)
  })

  it('encrypt → decrypt usando ENCRYPTION_KEY de env (fallback default)', () => {
    const original = process.env.ENCRYPTION_KEY
    process.env.ENCRYPTION_KEY = KEY_A
    try {
      const plain = 'desde env'
      const ct = encrypt(plain)
      assert.equal(decrypt(ct), plain)
    } finally {
      if (original === undefined) delete process.env.ENCRYPTION_KEY
      else process.env.ENCRYPTION_KEY = original
    }
  })
})

describe('crypto: nullables y vacíos', () => {
  it('encrypt(null) → null, encrypt(undefined) → null', () => {
    assert.equal(encrypt(null, KEY_A), null)
    assert.equal(encrypt(undefined, KEY_A), null)
  })

  it("encrypt('') → '' (no se encripta vacío)", () => {
    assert.equal(encrypt('', KEY_A), '')
  })

  it('decrypt(null/undefined/empty) → null', () => {
    assert.equal(decrypt(null, KEY_A), null)
    assert.equal(decrypt(undefined, KEY_A), null)
    assert.equal(decrypt('', KEY_A), null)
  })
})

describe('crypto: decrypt con key incorrecta', () => {
  it('decrypt con key distinta a la de encrypt lanza error', () => {
    const ct = encrypt('algo', KEY_A)
    assert.ok(ct)
    assert.throws(() => decrypt(ct, KEY_B), {
      // GCM detecta tag mismatch en `decipher.final()`
      message: /unable to authenticate|Unsupported state/i,
    })
  })

  it('decrypt con ciphertext corrupto lanza error', () => {
    const ct = encrypt('algo', KEY_A)!
    // Cambio el último char del base64 → AuthTag o cipher data se corrompe
    const corrupted = ct.slice(0, -2) + (ct.slice(-2, -1) === 'A' ? 'B' : 'A') + ct.slice(-1)
    assert.throws(() => decrypt(corrupted, KEY_A))
  })

  it('decrypt con base64 demasiado corto lanza error de formato', () => {
    // Menos de 12+16 bytes (IV + AuthTag mínimo)
    const tooShort = Buffer.alloc(20).toString('base64')
    assert.throws(() => decrypt(tooShort, KEY_A), {
      message: /Ciphertext corrupto/,
    })
  })
})

describe('crypto: validación de key — fail fast en construcción', () => {
  it('encrypt con key de longitud incorrecta tira error inmediato (no al "desencriptar")', () => {
    const shortKey = 'demasiado-corta' // ASCII, ni siquiera 32 chars
    assert.throws(() => encrypt('algo', shortKey), {
      message: /ENCRYPTION_KEY inválida/,
    })
  })

  it('decrypt con key de longitud incorrecta tira error inmediato', () => {
    const ct = encrypt('algo', KEY_A)!
    assert.throws(() => decrypt(ct, 'wrong-length-key'), {
      message: /ENCRYPTION_KEY inválida/,
    })
  })

  it('encrypt con Buffer de longitud incorrecta tira error inmediato', () => {
    const wrongBuf = Buffer.alloc(16) // 16 bytes en vez de 32
    assert.throws(() => encrypt('algo', wrongBuf), {
      message: /ENCRYPTION_KEY inválida/,
    })
  })

  it('encrypt sin ENCRYPTION_KEY en env y sin override tira error informativo', () => {
    const original = process.env.ENCRYPTION_KEY
    delete process.env.ENCRYPTION_KEY
    try {
      assert.throws(() => encrypt('algo'), {
        message: /ENCRYPTION_KEY no está definida/,
      })
    } finally {
      if (original !== undefined) process.env.ENCRYPTION_KEY = original
    }
  })

  it('rechaza key con base64 que NO decodea a 32 bytes (regression: sin fallback SHA-256)', () => {
    // 'mi-pass-123' como pseudo-key ASCII: base64-decode da bytes != 32
    const ambiguousKey = 'mi-pass-123'
    assert.throws(() => encrypt('algo', ambiguousKey), {
      message: /ENCRYPTION_KEY inválida/,
    })
    // Si hubiera fallback SHA-256, este encrypt habría tenido éxito.
  })
})

describe('crypto: rotate sin mutar process.env', () => {
  it('rotate(ct, oldKey, newKey) devuelve ciphertext desencriptable con newKey', () => {
    const plain = 'token a rotar'
    const ctOld = encrypt(plain, KEY_A)!
    const ctNew = rotate(ctOld, KEY_A, KEY_B)

    assert.notEqual(ctNew, ctOld, 'el ciphertext rotado debe ser distinto')
    assert.equal(decrypt(ctNew, KEY_B), plain, 'newKey desencripta el rotado')
    assert.throws(() => decrypt(ctNew, KEY_A), {
      message: /unable to authenticate|Unsupported state/i,
    })
  })

  it('rotate NO toca process.env.ENCRYPTION_KEY', () => {
    const sentinel = randomBytes(32).toString('base64')
    const original = process.env.ENCRYPTION_KEY
    process.env.ENCRYPTION_KEY = sentinel
    try {
      const ct = encrypt('algo', KEY_A)!
      rotate(ct, KEY_A, KEY_B)
      assert.equal(
        process.env.ENCRYPTION_KEY,
        sentinel,
        'rotate no debe modificar el env, ni en éxito ni en error',
      )
    } finally {
      if (original === undefined) delete process.env.ENCRYPTION_KEY
      else process.env.ENCRYPTION_KEY = original
    }
  })

  it('rotate con oldKey incorrecta lanza error claro y no muta env', () => {
    const sentinel = randomBytes(32).toString('base64')
    const original = process.env.ENCRYPTION_KEY
    process.env.ENCRYPTION_KEY = sentinel
    try {
      const ct = encrypt('algo', KEY_A)!
      assert.throws(() => rotate(ct, KEY_B /* wrong */, KEY_A))
      assert.equal(process.env.ENCRYPTION_KEY, sentinel)
    } finally {
      if (original === undefined) delete process.env.ENCRYPTION_KEY
      else process.env.ENCRYPTION_KEY = original
    }
  })
})

describe('crypto: concurrencia simulada (rotate no race con encrypts paralelos)', () => {
  before(() => {
    process.env.ENCRYPTION_KEY = KEY_A
  })

  it('encrypts en env durante un rotate siguen usando KEY_A consistentemente', async () => {
    // Simula concurrencia: dispara N encrypt-via-env mientras rotate corre con keys explícitas.
    // Si rotate mutaba env, alguno de los encrypts pasaría a usar KEY_B y fallaría al desencriptar con KEY_A.
    const plain = 'consistencia bajo concurrencia'
    const ctOld = encrypt(plain, KEY_A)!

    const tasks = Array.from({ length: 50 }, async () => {
      const ct = encrypt(plain) // usa env (KEY_A)
      // Si en algún punto del rotate, env cambió a KEY_B, esta línea fallaría:
      return decrypt(ct, KEY_A)
    })
    const rotateTask = (async () => rotate(ctOld, KEY_A, KEY_B))()

    const results = await Promise.all([...tasks, rotateTask])
    const decrypted = results.slice(0, -1)
    for (const d of decrypted) {
      assert.equal(d, plain)
    }
  })
})
