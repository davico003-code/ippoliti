# CLAUDE.md — Reglas operativas para Claude Code

Este archivo es leído automáticamente al inicio de cada sesión. Las reglas
aquí escritas tienen prioridad sobre instrucciones implícitas.

## 1. Merges a `main` — NUNCA sin OK visual explícito

**NUNCA mergear a `main` sin que David haya validado en un preview de Vercel.**

Workflow obligatorio:

1. Toda feature/fix/chore va en su propia rama (`feat/...`, `fix/...`, `chore/...`)
2. Push de la rama → Vercel genera preview deployment automático
3. **ALTO acá.** Avisar a David con la URL del preview y esperar validación
   visual (idealmente en mobile real, no solo devtools)
4. Solo con **OK explícito** ("OK mergeá", "dale mergeá", "validé, andá") →
   `git checkout main && git merge --no-ff <rama> && git push origin main`
5. `git merge --no-ff` siempre (mantiene historia del feature como merge commit,
   consistente con el patrón establecido del repo)

### Qué NO es un OK explícito

- "ok" suelto
- "ok avanza" / "ok dale" / "ok avanza con todo"
- Silencio o ausencia de respuesta
- "ok hacelo" sin contexto previo de que "lo" se refiere a mergear

Ante cualquier ambigüedad sobre si debe hacerse merge, **PREGUNTAR** con
`AskUserQuestion`. El merge a main es difícilmente reversible y afecta
production en vivo.

### Por qué esta regla existe

El 15-may-2026 hubo merges silenciosos a `main` desde una sesión local
(refactor de acuerdo-comercializacion v2 + fixes de PDF) sin que David los
revisara visualmente. Production quedó sirviendo cambios no validados.
Generó bandera roja y auditoría completa. No se puede repetir.

## 2. Validez legal de acuerdos firmados

**Acuerdos con `status === 'firmada'` y `documento_snapshot` guardado son
inmutables por Ley 25.506.**

- Cada firma electrónica certifica conformidad con un texto específico.
  Modificar retroactivamente el texto invalidaría su valor probatorio.
- Cambios al template en `src/lib/autorizaciones/documentoTexto.ts` SOLO
  aplican a acuerdos futuros y pendientes no firmados.
- Los acuerdos firmados conservan su `documento_snapshot` original.
- El renderer del PDF (`AutorizacionPDF.tsx:251`) ya prioriza
  `documento_snapshot` sobre `getClausulas(auth)`. NO romper esa prioridad.
- Si se cambia el template legal, también bumpear `DOCUMENTO_VERSION` para
  que el snapshot quede etiquetado con la versión vigente al firmar.

## 3. Branding — SI INMOBILIARIA siempre en uppercase

En copy, schema, alt text, emails, OG meta, logs públicos: **SI INMOBILIARIA**
(uppercase). Es la marca oficial. No "Si Inmobiliaria", no "si inmobiliaria",
no "S.I. Inmobiliaria".

## 4. Estructura del proyecto (mapa rápido)

- `src/app/(autorizacion)/` — vistas públicas del cliente (autorización de venta digital)
- `src/app/(main)/recursos/autorizaciones/` — panel del agente (gating con `SI_TEAM_CODE`)
- `src/app/(main)/api/autorizaciones/` — endpoints CRUD + firma + PDF + listar
- `src/lib/autorizaciones/` — schema, helpers Redis, template del documento legal
- `src/components/autorizaciones/AutorizacionPDF.tsx` — PDF con `@react-pdf/renderer`

## 5. Configuración local

- `.claude/settings.local.json` está trackeado pero contiene configuración
  personal. Si se modifica, mejor stashearlo antes de cambiar de rama.
- `.claude/skills/` y `.playwright-mcp/` son locales — ya están en `.gitignore`.
