#!/usr/bin/env node
/**
 * Ronda Funes Roldán — carga en Redis la copia de los avisos de Zonaprop que Hilo
 * ya tiene leídos (tabla `avisos_detalle`), para que un colega que pega el link
 * de Zonaprop no tenga que cargar la propiedad a mano.
 *
 * La Ronda lee el aviso en el momento (src/lib/ronda/zonaprop-busqueda.ts), pero
 * esa lectura trae solo las primeras 8 fotos y la descripción sin renglones.
 * Esta copia la completa (todas las fotos, el texto con formato) y la reemplaza
 * cuando el aviso hoy no figura publicado o Zonaprop no responde.
 *
 * La copia NO se actualiza sola: es una foto de lo leído hasta ese día (cada
 * registro lleva `leido`). Volver a correr este script la refresca.
 *
 * Uso (las credenciales de Hilo se pasan por variable, no viven en este repo):
 *   HILO_SUPABASE_URL=… HILO_SUPABASE_SERVICE_ROLE_KEY=… node scripts/ronda-copia-zonaprop.mjs
 * Lee KV_REST_API_URL / KV_REST_API_TOKEN de .env.local.
 */
import fs from 'node:fs'
import { Redis } from '@upstash/redis'

const CLAVE = 'ronda:zonaprop'
const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split('\n').filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, '')] }),
)
const base = process.env.HILO_SUPABASE_URL
const llave = process.env.HILO_SUPABASE_SERVICE_ROLE_KEY
if (!base || !llave) throw new Error('Faltan HILO_SUPABASE_URL y HILO_SUPABASE_SERVICE_ROLE_KEY')

const COLUMNAS = 'aviso_id,url,titulo,tipo,operacion,precio,moneda,dormitorios,banos,cocheras,ambientes,sup_total_m2,sup_cub_m2,barrio,localidad,anunciante,fotos,descripcion,detalle_at'
const filas = []
for (let desde = 0; ; desde += 1000) {
  const res = await fetch(`${base}/rest/v1/avisos_detalle?select=${COLUMNAS}&portal=eq.zonaprop&estado=neq.no_disponible&order=aviso_id`, {
    headers: { apikey: llave, authorization: `Bearer ${llave}`, range: `${desde}-${desde + 999}` },
  })
  if (!res.ok) throw new Error(`Hilo respondió ${res.status}`)
  const tanda = await res.json()
  filas.push(...tanda)
  if (tanda.length < 1000) break
}

const copias = filas
  .map((f) => ({
    id: String(f.aviso_id),
    url: f.url,
    titulo: f.titulo ?? '',
    tipo: f.tipo ?? '',
    operacion: f.operacion ?? '',
    precio: Number(f.precio) > 0 ? Number(f.precio) : null,
    moneda: f.moneda === 'ARS' ? 'ARS' : 'USD',
    dormitorios: f.dormitorios ?? null,
    banos: f.banos ?? null,
    cocheras: f.cocheras ?? null,
    ambientes: f.ambientes ?? null,
    supTotal: f.sup_total_m2 ?? null,
    supCub: f.sup_cub_m2 ?? null,
    barrio: f.barrio ?? null,
    localidad: f.localidad ?? null,
    anunciante: f.anunciante ?? null,
    fotos: (Array.isArray(f.fotos) ? f.fotos : []).filter((u) => typeof u === 'string' && u.startsWith('https://')).slice(0, 20),
    descripcion: String(f.descripcion ?? '').slice(0, 3000),
    leido: f.detalle_at,
  }))
  .filter((c) => /^\d{6,12}$/.test(c.id) && c.fotos.length > 0)

const redis = new Redis({ url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN })
const vigentes = new Set(copias.map((c) => c.id))
const viejas = (await redis.hkeys(CLAVE)).filter((id) => !vigentes.has(id))
for (let i = 0; i < copias.length; i += 100) {
  await redis.hset(CLAVE, Object.fromEntries(copias.slice(i, i + 100).map((c) => [c.id, c])))
}
if (viejas.length) await redis.hdel(CLAVE, ...viejas)

const ultima = copias.map((c) => c.leido).sort().at(-1)
console.log(`Copia de Zonaprop: ${copias.length} avisos (de ${filas.length} leídos) · ${viejas.length} sacados · último leído ${String(ultima).slice(0, 10)} · en Redis ${await redis.hlen(CLAVE)}`)
