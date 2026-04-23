import { createBrowserClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase para componentes del lado browser.
 * Usa NEXT_PUBLIC_SUPABASE_ANON_KEY — respeta RLS según la sesión del user.
 *
 * Llamalo desde 'use client' components:
 *   const supabase = createClient()
 *   const { data } = await supabase.from('leads').select('*')
 */
export function createClient(): SupabaseClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// Re-export por si algún caller necesita el tipo de las opciones de cookie
export type { CookieOptions }
