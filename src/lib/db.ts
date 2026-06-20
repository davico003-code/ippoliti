// Cliente Neon Postgres (serverless HTTP driver). Se usa para archivar el
// feedback agregado por propiedad. La conexión viene del marketplace de Vercel
// (Neon) vía DATABASE_URL. Sólo se usa en route handlers server-side.

import { neon } from '@neondatabase/serverless'

// DATABASE_URL (pooled) es la conexión recomendada para serverless. No se
// valida en import-time (rompería el build si falta el env); se valida acá.
export function getSql() {
  const cs = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!cs) throw new Error('DATABASE_URL no configurada (Neon)')
  return neon(cs)
}

/** Crea la tabla property_feedback si no existe (idempotente). */
export async function ensurePropertyFeedbackTable(): Promise<void> {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS property_feedback (
      property_id   TEXT PRIMARY KEY,
      address       TEXT,
      price_label   TEXT,
      published_price BIGINT,
      likes         INTEGER NOT NULL DEFAULT 0,
      react         JSONB   NOT NULL DEFAULT '{}'::jsonb,
      valuation     JSONB   NOT NULL DEFAULT '{}'::jsonb,
      objection     JSONB   NOT NULL DEFAULT '{}'::jsonb,
      leads         JSONB   NOT NULL DEFAULT '[]'::jsonb,
      total         INTEGER NOT NULL DEFAULT 0,
      custom        JSONB   NOT NULL DEFAULT '{}'::jsonb,
      archived_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
}
