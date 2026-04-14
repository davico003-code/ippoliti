# Blog Writer — SI Inmobiliaria

## Qué hace
Martes y viernes a las 8am AR (11am UTC), toma los temas aprobados por el admin el lunes, genera una nota editorial con Claude Opus, la valida automáticamente y la publica en Vercel Blob. Si falla 3 veces, alerta por WhatsApp.

## Schedule
- **Martes 11:00 UTC** → `GET /api/cron/blog-writer-martes`
- **Viernes 11:00 UTC** → `GET /api/cron/blog-writer-viernes`
- Auth: `Authorization: Bearer $CRON_SECRET`

## Flujo
1. Lee `blog:temas_aprobados` de Redis (guardados por el webhook de aprobación del lunes).
2. Elige tema[0] (martes) o tema[1] (viernes).
3. Selecciona CTA rotando (menos usado de los últimos 4).
4. Llama Claude Opus con system prompt (style guide + taboos) + user prompt (tema + CTA + contexto).
5. Valida el draft: largo, tabúes, clichés, estructura, firma, slug, HTML seguro.
6. Si falla: reintenta hasta 2 veces con feedback específico.
7. Si ok: publica en Vercel Blob (`blog-posts/{slug}.json`), marca en Redis, revalida Next.js.
8. WhatsApp al admin con link en vivo.

## Testing local

```bash
# 1. Variables en .env.local:
#    ANTHROPIC_API_KEY, KV_REST_API_URL, KV_REST_API_TOKEN,
#    CRON_SECRET, REVALIDATE_SECRET, BLOB_READ_WRITE_TOKEN

# 2. Simular temas aprobados en Redis (sin esperar el flujo del lunes)
# Desde dashboard Upstash o CLI:
# SET blog:temas_aprobados '[{"titulo":"Crédito UVA en Funes: qué cambió en 2026","angulo_local":"Impacto en zona oeste","keywords_seo":["crédito uva funes"],"fuentes_consultar":["BCRA"],"tipo":"coyuntura","urgencia":"media","score_seo":8},{"titulo":"Roldán norte vs sur: dónde conviene comprar","angulo_local":"Mapa de barrios","keywords_seo":["roldán barrios"],"fuentes_consultar":["Datos propios"],"tipo":"zoom_barrio","urgencia":"baja","score_seo":7}]' EX 172800

# 3. Disparar el writer martes manualmente
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/blog-writer-martes

# 4. Verificar publicación
# - Vercel Blob dashboard: buscar blog-posts/{slug}.json
# - Redis: blog:publicada:{slug}
# - Browser: http://localhost:3000/blog/{slug}
```

## Validaciones
| Check | Criterio | Error |
|-------|----------|-------|
| Largo | 700-1400 palabras | "contenido muy corto/largo: N palabras" |
| Tabúes | Políticos, crypto, competidores | "mención de X prohibido" |
| Clichés | 8 frases prohibidas | "cliché prohibido encontrado" |
| Estructura | Mínimo 2 H2 | "N subtítulos H2 (mínimo 2)" |
| Firma | "David Flores" en últimas 200 palabras | "falta firma" |
| Campos | titulo, slug, meta, bajada, etc. | campo-específico |
| HTML | Sin script/iframe | "HTML potencialmente peligroso" |

## Despublicar una nota
```bash
# 1. Borrar blob
npx vercel blob del blog-posts/{slug}.json

# 2. Borrar Redis
# En dashboard Upstash: DEL blog:publicada:{slug}

# 3. Revalidar
curl -X POST -H "Authorization: Bearer $REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"slug":"el-slug-a-borrar"}' \
  https://siinmobiliaria.com/api/revalidate
```

## Variables de entorno requeridas
| Variable | Descripción |
|----------|-------------|
| `ANTHROPIC_API_KEY` | API key de Anthropic (Claude) |
| `KV_REST_API_URL` | URL de Upstash Redis |
| `KV_REST_API_TOKEN` | Token de Upstash Redis |
| `CRON_SECRET` | Secret para autenticar crons |
| `REVALIDATE_SECRET` | Secret para revalidar rutas Next.js |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (expuesta automáticamente si Blob está conectado al proyecto) |
