# SECURITY TODO

## Pendientes de rotación

Las siguientes credenciales fueron pegadas en chat con un asistente LLM durante el setup inicial del proyecto Supabase (2026-04-22). Aunque la conversación es privada, las plataformas LLM pueden retener logs por períodos prolongados. **Rotar antes de mover el proyecto a producción.**

- [ ] **Rotar `SUPABASE_SERVICE_ROLE_KEY`**
  - Supabase Dashboard → Settings → API → "Reset service_role key"
  - Después: actualizar `.env.local` + Vercel env vars (Production / Preview / Development)
  - Es crítico: bypasses RLS, otorga acceso total a la DB

- [ ] **Rotar `SUPABASE_DB_PASSWORD`**
  - Supabase Dashboard → Settings → Database → "Reset database password"
  - Después: actualizar `.env.local`. Re-correr `supabase link --password <nuevo>`
  - Crítico: acceso directo a Postgres vía CLI o cualquier cliente

## Razón

Credenciales pegadas en chat LLM durante setup inicial 2026-04-22.

## Lo que NO hace falta rotar

- `NEXT_PUBLIC_SUPABASE_URL` — público por diseño (va al browser).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — público por diseño (va al browser, RLS lo limita).
- `ENCRYPTION_KEY` — generada localmente con `openssl rand -base64 32`, nunca expuesta en chat. Su valor está solo en `.env.local`. **NO ROTAR sin migrar columnas `*_encrypted` existentes** (usar `rotate()` de `src/lib/crypto.ts` para re-encriptar todos los registros antes).

## Cuándo

Recomendado: al final de la jornada del 2026-04-22 cuando todo el flujo esté andando end-to-end.
