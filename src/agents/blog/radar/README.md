# Blog Radar — SI Inmobiliaria

## Qué hace
Cada lunes a las 7am AR (10am UTC) el cron scrapea 16 fuentes de noticias, puntúa los titulares y propone 5 temas para el blog vía WhatsApp. El admin responde con 2 números para aprobar.

## Schedule
- **Lunes 10:00 UTC** → `GET /api/cron/blog-radar` (Vercel Cron)
- Auth: `Authorization: Bearer $CRON_SECRET`

## Flujo
1. `generarPropuestasSemanales()` scrapea RSS/HTML, puntúa, llama a Claude Haiku, deduplica.
2. Las 5 propuestas se guardan en Redis (`blog:temas_semana`, TTL 14 días).
3. Se envía mensaje WhatsApp formateado al admin.
4. El admin responde "1,3" o "2 y 5" → `POST /api/whatsapp/aprobacion-blog`.
5. Los temas aprobados se guardan en `blog:temas_aprobados` para el writer (martes y viernes).

## Testing local

```bash
# 1. Asegurar variables en .env.local:
#    ANTHROPIC_API_KEY, KV_REST_API_URL, KV_REST_API_TOKEN, CRON_SECRET

# 2. Levantar dev server
npm run dev

# 3. Disparar el radar manualmente
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/blog-radar

# 4. Verificar Redis (requiere upstash CLI o dashboard)
# Key: blog:temas_semana → JSON con 5 propuestas

# 5. Simular aprobación del admin
curl -X POST http://localhost:3000/api/whatsapp/aprobacion-blog \
  -H "Content-Type: application/json" \
  -d '{"from": "+5493412101694", "text": "1,3"}'
```

## Redis keys
| Key | Contenido | TTL |
|-----|-----------|-----|
| `blog:temas_semana` | JSON de 5 TemaPropuesto | 14 días |
| `blog:temas_aprobados` | JSON de 2 TemaPropuesto aprobados | 48 horas |
| `blog:temas_usados` | Array de títulos usados (últimos 30) | sin expiración |

## Modelo
- Radar: `claude-haiku-4-5-20251001` (tarea mecánica, bajo costo)
- Writer (Fase 3): `claude-opus-4-6`
