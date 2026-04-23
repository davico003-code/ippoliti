import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase con SERVICE_ROLE_KEY — bypasses RLS.
 *
 * USO: API routes, crons, webhooks, scripts internos. Cualquier lugar
 * donde necesites operar sobre datos de cualquier organización sin
 * la sesión de un user.
 *
 * NO usar en Server Components que renderizan UI con datos del user
 * (saltea RLS y rompe el aislamiento multi-tenant). Para eso falta
 * crear createUserClient() con cookies + anon key — ver TODO al final.
 *
 * El import 'server-only' garantiza que este módulo nunca llegue al
 * bundle del browser (Next lo rechaza si se importa desde un client component).
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL no está configurada')
  }
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// TODO (cuando hagamos UI con sesión de user):
//   export async function createUserClient(): SupabaseClient {
//     // createServerClient de @supabase/ssr, leyendo cookies de Next,
//     // usando NEXT_PUBLIC_SUPABASE_ANON_KEY → respeta RLS por user.
//   }
