import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Helper para refresh de la sesión Supabase en cada request.
 *
 * Llamado desde src/middleware.ts. Patrón oficial de @supabase/ssr para
 * Next.js 14 App Router:
 *
 *   - Lee cookies del request (auth-token, refresh-token).
 *   - Llama supabase.auth.getUser() — si el access token expiró, refresca.
 *   - Setea las cookies actualizadas en el response que se devuelve.
 *
 * IMPORTANTE: NO meter lógica entre createServerClient() y getUser() —
 * el patrón depende de que ese par sea atómico para evitar race conditions
 * en el refresh del token.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresca el token si expiró. NO mover esta llamada.
  await supabase.auth.getUser()

  return supabaseResponse
}
