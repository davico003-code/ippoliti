#!/usr/bin/env node
/**
 * Ronda Funes Roldán — pone (o cambia) la clave de acceso.
 *
 *   node scripts/ronda-clave.mjs "<clave nueva>"            → la Ronda real
 *   node scripts/ronda-clave.mjs "<clave nueva>" --prueba   → la de pruebas locales
 *   node scripts/ronda-clave.mjs --abrir  [--prueba]        → sin clave por ahora (todos entran)
 *   node scripts/ronda-clave.mjs --cerrar [--prueba]        → vuelve a pedir la MISMA clave de antes
 *
 * En la base queda solo la huella de la clave (sha-256 con sal), nunca la
 * clave. Cambiarla deja sin efecto los pases anteriores: todos los colegas
 * tienen que escribir la nueva. Lee KV_REST_API_URL / KV_REST_API_TOKEN de
 * .env.local. La clave no distingue mayúsculas ni espacios.
 */
import fs from 'node:fs'
import { createHash, randomBytes } from 'node:crypto'
import { Redis } from '@upstash/redis'

const prefijo = process.argv.includes('--prueba') ? 'ronda-prueba' : 'ronda'
const abrir = process.argv.includes('--abrir')
const cerrar = process.argv.includes('--cerrar')
const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split('\n').filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, '')] }),
)
const redis = new Redis({ url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN })
if (abrir || cerrar) {
  // Abre o cierra sin tocar la clave: al cerrar vuelve la misma y siguen valiendo los pases.
  const actual = await redis.get(`${prefijo}:acceso`)
  const r = typeof actual === 'string' ? JSON.parse(actual) : actual
  if (!r?.huella) throw new Error('No hay clave configurada: primero ponela con node scripts/ronda-clave.mjs "<clave>".')
  await redis.set(`${prefijo}:acceso`, JSON.stringify({ ...r, abierta: abrir }))
  console.log(abrir ? `${prefijo}: ABIERTA, se entra sin clave.` : `${prefijo}: CERRADA, vuelve a pedir la clave de antes.`)
  process.exit(0)
}
const clave = String(process.argv[2] ?? '').toLowerCase().replace(/\s+/g, '')
if (clave.length < 6) throw new Error('La clave tiene que tener al menos 6 caracteres.')
const sal = randomBytes(16).toString('hex')
const registro = { sal, huella: createHash('sha256').update(`${sal}:${clave}`).digest('hex'), version: Date.now() }
await redis.set(`${prefijo}:acceso`, JSON.stringify(registro))
console.log(`Clave de acceso de ${prefijo} cambiada (${clave.length} caracteres). Los pases anteriores ya no sirven.`)
