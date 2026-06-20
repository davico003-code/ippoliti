// Helpers server-side compartidos para el feedback anónimo de propiedades.
//
// Toda la persistencia vive en route handlers `force-dynamic` bajo
// /api/feedback/* — NUNCA dentro de un render ISR/static (eso degradaría la
// ficha a dynamic y rompería el ISR como ya pasó una vez). Este módulo se
// importa SOLO desde esos handlers.
//
// Identidad anónima: cookie `si_vid` (UUID, httpOnly). Se usa para dedupe
// (un like/reacción/valuación por visitante) y para reconstruir el estado al
// cargar. Anti-spam: rate-limit por IP con Redis (patrón DIY, igual que
// /api/colega/feedback).

import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import type { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export const VID_COOKIE = 'si_vid'
const VID_MAXAGE = 365 * 86400 // 1 año
export const FB_TTL = 365 * 86400 // 1 año para todas las claves de feedback

export const REACT_CHOICES = ['encanta', 'duda', 'cara', 'no'] as const
export type ReactChoice = (typeof REACT_CHOICES)[number]

export const OBJECTION_CHOICES = ['estado', 'ubicacion', 'tamano', 'metro', 'expensas'] as const
export type ObjectionChoice = (typeof OBJECTION_CHOICES)[number]

export const ALERT_CANALES = ['whatsapp', 'email'] as const
export type AlertCanal = (typeof ALERT_CANALES)[number]

/** Prefijo de claves Redis para una propiedad: `feedback:property:{id}`. */
export function fbKey(id: string | number): string {
  return `feedback:property:${id}`
}

export function getIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

/** Lee el vid de la cookie (o null si el visitante no tiene una todavía). */
export function readVid(): string | null {
  return cookies().get(VID_COOKIE)?.value ?? null
}

export function genVid(): string {
  return randomUUID()
}

/** Setea la cookie httpOnly `si_vid` en la respuesta (solo en primer contacto). */
export function setVidCookie(res: NextResponse, vid: string): void {
  res.cookies.set(VID_COOKIE, vid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: VID_MAXAGE,
    path: '/',
  })
}

/**
 * Garantiza un vid para el request: devuelve el existente o genera uno nuevo.
 * `isNew` indica si hay que setear la cookie en la respuesta.
 */
export function ensureVid(): { vid: string; isNew: boolean } {
  const existing = readVid()
  if (existing) return { vid: existing, isNew: false }
  return { vid: genVid(), isNew: true }
}

/** Rate-limit por IP con Redis. Devuelve true si está permitido. */
export async function rateLimit(
  ip: string,
  bucket: string,
  limit: number,
  windowSec = 60,
): Promise<boolean> {
  try {
    const key = `feedback:rl:${bucket}:${ip}`
    const n = await redis.incr(key)
    if (n === 1) await redis.expire(key, windowSec)
    return n <= limit
  } catch {
    // Si Redis falla en el rate-limit, no bloqueamos el flujo principal.
    return true
  }
}

/** Normaliza/valida un propertyId entero positivo. Devuelve string o null. */
export function parsePropertyId(v: unknown): string | null {
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return String(Math.trunc(v))
  if (typeof v === 'string' && /^\d+$/.test(v.trim())) return v.trim()
  return null
}
