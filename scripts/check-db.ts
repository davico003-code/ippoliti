/**
 * Script de verificación de la DB Supabase.
 *
 * Uso: npm run db:check
 *
 * Hace 3 cosas:
 *   1. Conecta con SERVICE_ROLE_KEY (bypasses RLS).
 *   2. Cuenta filas en cada tabla del schema (0001 + 0002).
 *   3. Lista las RLS policies vía RPC `list_rls_policies` (helper SQL).
 *
 * Si la función `list_rls_policies` aún no existe en la DB, el script
 * imprime el SQL que hay que correr UNA VEZ en Supabase SQL Editor para
 * habilitarla.
 */

import { createClient } from '@supabase/supabase-js'

const TABLES = [
  // Migration 0001
  'organizations',
  'agents',
  'invitations',
  'properties',
  'property_photos',
  'property_videos',
  'property_changes',
  // Migration 0002
  'leads',
  'interactions',
  'conversations',
  'messages',
  'lead_scoring_events',
  'next_actions',
  'publications',
] as const

const POLICY_LISTING_SQL = `-- Pegar UNA VEZ en Supabase SQL Editor para habilitar el listado de policies
create or replace function public.list_rls_policies()
returns table(
  schemaname text,
  tablename text,
  policyname text,
  cmd text,
  qual text,
  with_check text
)
language sql
security definer
set search_path = public, pg_catalog
as $$
  select
    schemaname::text,
    tablename::text,
    policyname::text,
    cmd::text,
    qual::text,
    with_check::text
  from pg_policies
  where schemaname = 'public'
  order by tablename, policyname;
$$;

grant execute on function public.list_rls_policies() to service_role;`

interface PolicyRow {
  schemaname: string
  tablename: string
  policyname: string
  cmd: string
  qual: string | null
  with_check: string | null
}

function exitWith(msg: string, code = 1): never {
  console.error(`\n❌ ${msg}`)
  process.exit(code)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url) exitWith('NEXT_PUBLIC_SUPABASE_URL no está seteada en el entorno.')
if (!key) exitWith('SUPABASE_SERVICE_ROLE_KEY no está seteada en el entorno.')

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function countTables() {
  console.log('\n═══ TABLAS ═══\n')
  let totalTables = 0
  let totalRows = 0
  let missing = 0

  for (const t of TABLES) {
    try {
      const { count, error } = await supabase
        .from(t)
        .select('*', { count: 'exact', head: true })
      if (error) {
        console.log(`  ${t.padEnd(25)} ❌  ${error.message}`)
        missing++
        continue
      }
      const rows = count ?? 0
      console.log(`  ${t.padEnd(25)} ${String(rows).padStart(8)} rows`)
      totalTables++
      totalRows += rows
    } catch (e) {
      console.log(`  ${t.padEnd(25)} ❌  ${(e as Error).message}`)
      missing++
    }
  }

  console.log(`\n  ${totalTables}/${TABLES.length} tablas accesibles · ${totalRows} filas totales`)
  if (missing > 0) console.log(`  ⚠  ${missing} tablas con error (¿migraciones aplicadas?)`)
  return missing === 0
}

async function listPolicies() {
  console.log('\n═══ RLS POLICIES ═══\n')

  const { data, error } = await supabase.rpc('list_rls_policies')

  if (error) {
    const notFound =
      error.code === 'PGRST202' ||
      /Could not find.*function|does not exist/i.test(error.message)
    if (notFound) {
      console.log('  ⚠  La función `list_rls_policies` no existe en la DB.')
      console.log('  Ejecutá UNA VEZ esto en Supabase → SQL Editor:\n')
      console.log('  ' + '─'.repeat(72))
      console.log(POLICY_LISTING_SQL.split('\n').map(l => '  ' + l).join('\n'))
      console.log('  ' + '─'.repeat(72))
      return
    }
    console.log(`  ❌  ${error.message}`)
    return
  }

  const rows = (data ?? []) as PolicyRow[]
  if (rows.length === 0) {
    console.log('  (sin policies — ¿RLS deshabilitado?)')
    return
  }

  const grouped = new Map<string, PolicyRow[]>()
  for (const r of rows) {
    const arr = grouped.get(r.tablename) ?? []
    arr.push(r)
    grouped.set(r.tablename, arr)
  }

  for (const [table, policies] of Array.from(grouped)) {
    console.log(`  ${table}:`)
    for (const p of policies) {
      console.log(`    - ${p.policyname.padEnd(28)} ${p.cmd}`)
    }
  }

  console.log(`\n  Total: ${rows.length} policies en ${grouped.size} tablas`)
}

async function main() {
  console.log(`\n🔍 Supabase DB Check`)
  console.log(`   ${url}`)
  await countTables()
  await listPolicies()
  console.log('')
}

main().catch((e) => exitWith(e instanceof Error ? e.message : String(e)))
