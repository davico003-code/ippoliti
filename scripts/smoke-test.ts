/**
 * Smoke test end-to-end de la base Supabase.
 *
 * Uso: npm run db:smoke
 *
 * Hace 3 queries con SERVICE_ROLE_KEY (bypasses RLS) y valida:
 *   1. organizations tiene exactamente 1 fila (seed inicial).
 *   2. La org seed es 'si' / 'SI INMOBILIARIA'.
 *   3. leads está vacía (0 filas).
 *
 * Imprime "✅ Smoke test OK" si todo pasa, falla con exit 1 si algo no cuadra.
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL no está seteada.')
  process.exit(1)
}
if (!key) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no está seteada.')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function expect(label: string, cond: boolean, detail?: string) {
  if (!cond) {
    console.error(`❌ ${label}` + (detail ? ` — ${detail}` : ''))
    process.exit(1)
  }
  console.log(`✓  ${label}`)
}

async function main() {
  console.log(`\n🔥 Smoke test — ${url}\n`)

  // 1. count organizations === 1
  const { count: orgCount, error: orgCountErr } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })
  if (orgCountErr) {
    console.error(`❌ count organizations: ${orgCountErr.message}`)
    process.exit(1)
  }
  await expect(
    `organizations.count = 1 (got ${orgCount})`,
    orgCount === 1,
  )

  // 2. SI org by slug
  const { data: si, error: siErr } = await supabase
    .from('organizations')
    .select('slug, name')
    .eq('slug', 'si')
    .single()
  if (siErr) {
    console.error(`❌ select si org: ${siErr.message}`)
    process.exit(1)
  }
  await expect(
    `organization slug='si' exists (slug=${si?.slug}, name=${si?.name})`,
    si?.slug === 'si' && si?.name === 'SI INMOBILIARIA',
  )

  // 3. count leads === 0
  const { count: leadCount, error: leadErr } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
  if (leadErr) {
    console.error(`❌ count leads: ${leadErr.message}`)
    process.exit(1)
  }
  await expect(
    `leads.count = 0 (got ${leadCount})`,
    leadCount === 0,
  )

  console.log('\n✅ Smoke test OK\n')
}

main().catch((e) => {
  console.error(`\n❌ ${e instanceof Error ? e.message : e}`)
  process.exit(1)
})
