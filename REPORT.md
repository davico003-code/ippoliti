# Reporte — Sección `/barrios-privados`

Fecha: 2026-05-13
Autor: David Flores (Mat. N° 0621) — implementación con asistencia Claude (Opus 4.7)
Stack: Next.js 14.2.35 · App Router · Tailwind · Tokko CRM · Upstash Redis · Leaflet/OSM

---

## 1. Rutas creadas

### Páginas

| Ruta | Tipo | First Load JS | Notas |
|------|------|---------------|-------|
| `/barrios-privados` | Static | 122 kB | Hub con 10 bloques |
| `/barrios-privados/[slug]` × 11 | SSG (prerendered) | 122 kB | Landing con 16 bloques |

Los 11 slugs prerenderizados:
`san-sebastian`, `vida-lagoon`, `vida-barrio-cerrado`, `vida-club-de-campo`, `vida-jardin`,
`vida-green`, `kentucky`, `funes-hills-san-marino`, `funes-hills-cadaques`, `funes-lakes`,
`funes-hills-miraflores`.

### API endpoints

| Endpoint | Método | Notas |
|----------|--------|-------|
| `/api/barrios/[slug]/propiedades` | GET | `?tipo=Terreno\|Casa\|Departamento\|Todos`. Cache Upstash 1h + `Cache-Control: s-maxage=3600 stale-while-revalidate=86400`. |
| `/api/barrios/lead` | POST | Crea contacto Tokko con tags `lead-web`, `barrios-privados` y `barrio-{slug}-interesado` por cada slug seleccionado. Guarda copia en Redis listas `leads:all` y `leads:barrios`. |

### Lib

- `src/lib/barrios.ts` — fuente única (898 líneas, 11 barrios).
- `src/lib/barrios/calculadora.ts` — scoring puro presupuesto + prioridades + composición.
- `src/lib/barrios/faq.ts` — generador de FAQs por barrio y `HUB_FAQS`.
- `src/lib/tokko/barrio-matcher.ts` — match por developmentId / customTag / matchByTitle (normalizado).
- `src/lib/tokko/fetch-propiedades-por-barrio.ts` — fetch + cache Redis 1h + sort por id desc.

### Componentes (`src/components/barrios/`)

`BarrioHero`, `BarrioTabsNav`, `BarrioMiradaBroker`, `BarrioFichaTecnica`, `BarrioAmenities`,
`BarrioSeguridadAnillos` (diagrama o lista), `BarrioPerfil`, `BarrioLinderos`,
`BarrioStockTokko`, `BarrioComoSeCompra`, `BarrioUbicacion`, `BarrioFAQ`, `BarrioNewsletter`,
`BarrioCTAFinal`, `BarrioCard`, `BarrioGrid`, `BarrioFiltros`, `BarrioCalculadora`,
`BarrioComparador`, `BarrioMapa`+`BarrioMapaWrapper` (Leaflet+OSM dinámico SSR off),
`BarrioStatStrip`, `BarrioMediosLocales`, `BarrioImage`, `BarrioPlaceholderImg` (SVG fallback).

### SEO

- Sitemap raíz (`src/app/(main)/sitemap.ts`) suma 12 URLs nuevas (hub + 11 landings) con
  `priority: 0.9 changefreq: weekly`.
- `robots.ts` ya permite `/barrios-privados` (no estaba bloqueado).
- JSON-LD: `Place` con `address`+`geo` por landing, `FAQPage` por landing y para el hub,
  `ItemList` con los 11 barrios en el hub.
- Meta: `generateMetadata` lee `barrio.seo.metaTitle/metaDescription/keywordsLongTail` y emite
  `alternates.canonical`, OG y Twitter con la imagen hero.

### Tracking (GA4 + Meta Pixel)

Eventos GA4 (prefijo `barrios_`): `hub_view`, `landing_view`, `mapa_interact`,
`calculadora_complete`, `filter_apply`, `comparador_use`, `compartir_comparativa`,
`whatsapp_click`, `lead_submit`, `stock_view`. Pixel: `ViewContent` con
`content_category=barrio-{slug}` en cada landing y `Lead` en cada submit.

---

## 2. Pendientes (TODOs por completar con David)

Estos `// TODO` quedan marcados en el código — no hay datos inventados.

### Foto y assets

- `/public/team/david-flores.jpg` — foto real para `BarrioMiradaBroker` y `BarrioMediosLocales`
  (mientras esté ausente, `next/image` mostrará el roto; `BarrioImage` cubre los heros del
  barrio con SVG placeholder).
- `/public/barrios/{slug}/hero.jpg` — heros por barrio. Si faltan, el componente
  `BarrioPlaceholderImg` renderiza un SVG con el nombre del barrio (1920×1080 paper #FAF7F2 →
  #E2DDD2, tipografía Raleway, marca SI INMOBILIARIA al pie).
- `/og-default.jpg` — verificar que existe (lo usa el hub como OG fallback).

### Datos comerciales (`barrios.ts` → `barrio.comercial`)

Hoy solo Miraflores tiene precios (USD 75.000 lote, USD 110.000 casa). Pendiente para los 10
restantes:
- `precioLoteDesdeUSD`
- `precioCasaDesdeUSD`
- `expensasMensualARS`
- `valorM2ConstruidoUSD`

Cuando estén, la FAQ "¿Cuánto cuesta un lote en X?" deja de devolver el placeholder y muestra
el número real automáticamente.

### Tokko — identificación de propiedades

Cada barrio tiene `tokko.matchByTitle` configurado con sus nombres y variantes (con/sin
tilde). Si en Tokko se crean `Development` para los barrios, completar `tokko.developmentId`
para forzar match exacto. También `tokko.customTag` si se prefiere taggear con etiqueta
Tokko en lugar de matcher por título.

### Coordenadas

7 barrios no tienen `ubicacion.coordenadas`. El `BarrioMapa` usa fallbacks plausibles dentro
del corredor (ver `FALLBACK_COORDS` en `src/components/barrios/BarrioMapa.tsx`) para no
dejar marcadores en blanco. Cuando David cargue las coords exactas, los fallbacks se ignoran
automáticamente.

### Contenido editorial

- `BarrioMediosLocales` lista 4 columnas placeholder con `url: '#'`. Completar con URLs reales
  de InfoFunes / El Roldanense y agregar CTA "Leer todas las columnas".
- `BarrioComoSeCompra`: párrafos "Expensas" y "Valor m² construido" referencian rangos pero
  marcan `// TODO` para confirmar al cierre de cada mes.
- FAQ por barrio: la pregunta de financiación tiene `// TODO` esperando detalle real.

### Infraestructura

- 5 barrios tienen `infraestructura: ["Servicios completos (TODO: detallar)"]`. Reemplazar
  por el listado real cuando esté.

### POIs del mapa

Las coordenadas de Aeropuerto, colegios, sanatorios y supermercados en `BarrioMapa.POIS` son
plausibles del corredor; ajustar si querés precisión exacta.

---

## 3. Cómo testear las APIs

```bash
# 1. Listar lotes de un barrio (devuelve TokkoProperty[] desde cache Redis o Tokko)
curl -s "http://localhost:3000/api/barrios/san-sebastian/propiedades?tipo=Terreno" | jq '.total, .cached'

# 2. Casas en Funes Lakes
curl -s "http://localhost:3000/api/barrios/funes-lakes/propiedades?tipo=Casa" | jq '.properties[0].publication_title'

# 3. Todos los tipos en Kentucky
curl -s "http://localhost:3000/api/barrios/kentucky/propiedades?tipo=Todos" | jq '.total'

# 4. Slug inexistente → 404
curl -i "http://localhost:3000/api/barrios/no-existe/propiedades"

# 5. Lead de newsletter (todos los barrios opcionales)
curl -X POST "http://localhost:3000/api/barrios/lead" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test Comprador",
    "email": "test@example.com",
    "whatsapp": "3412101694",
    "barrios": ["san-sebastian", "funes-lakes"],
    "presupuesto": "150-300k",
    "origen": "newsletter-barrios"
  }'

# 6. Lead "interesado en barrio X"
curl -X POST "http://localhost:3000/api/barrios/lead" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "email": "test2@example.com",
    "barrios": ["kentucky"],
    "origen": "barrio-kentucky-interesado"
  }'
```

Comprobar que el contacto entra en Tokko con tags `lead-web`, `barrios-privados`,
`{origen}`, `barrio-{slug}-interesado`.

---

## 4. Variables de entorno requeridas

Ya configuradas (todas las que esta sección consume están en `.env.local`):

- `TOKKO_API_KEY` — listado y creación de contactos Tokko.
- `KV_REST_API_URL`, `KV_REST_API_TOKEN` — Upstash Redis para cache + leads.

Sin variables nuevas para esta sección. La lib de Redis es opcional: si las dos vars faltan,
el endpoint sigue funcionando pero sin cache (golpea Tokko directo en cada request).

---

## 5. Build production

```
✓ Compiled successfully
✓ Generating static pages (47/47)
✓ Collecting page data
```

Tamaños relevantes:

| Página | Page JS | First Load |
|--------|---------|------------|
| `/barrios-privados` | 8.52 kB | 122 kB |
| `/barrios-privados/[slug]` | 4.67 kB | 122 kB |
| First Load JS shared | — | 88.3 kB |

Los 11 slugs aparecen en el output como prerenderizados.

---

## 6. Lighthouse

**No ejecutado en esta sesión** — el entorno actual no tiene Chrome headless ni
`@lhci/cli` instalados de forma persistente.

Para correrlo localmente:

```bash
# Terminal 1
npm run build && npm run start

# Terminal 2
npx -y lighthouse http://localhost:3000/barrios-privados \
  --preset=desktop \
  --output=html \
  --output-path=./lighthouse-desktop.html \
  --chrome-flags="--headless=new"

npx -y lighthouse http://localhost:3000/barrios-privados \
  --output=html \
  --output-path=./lighthouse-mobile.html \
  --chrome-flags="--headless=new"

# Y para una landing
npx -y lighthouse http://localhost:3000/barrios-privados/san-sebastian \
  --output=html \
  --output-path=./lighthouse-san-sebastian.html \
  --chrome-flags="--headless=new"
```

Targets (acordados en plan):
- Performance > 85 mobile
- SEO 100

Notas para llegar a esos números si no se cumplen al primer corrido:

- Hero del hub: hoy es CSS+SVG, no carga imagen → no debería bloquear LCP.
- Heros de landing: usan `<Image priority>` con WebP automático; si falta foto el componente
  SVG es inline y no hace request.
- Mapa Leaflet: `dynamic({ ssr: false })` con loading skeleton → no afecta TTI hasta el
  scroll a esa sección.
- Tabs nav sticky usa `IntersectionObserver` (sin polyfill — ya está en Safari ≥ 12).
- iframe de Google Maps en `BarrioUbicacion` usa `loading="lazy"`.
- JSON-LD `dangerouslySetInnerHTML` con `JSON.stringify` en server component → 0 KB para JS
  del cliente.

---

## 7. Reglas no negociables cumplidas

1. ✅ No se copió texto de Rosseti / Edisur / Funes Hills / Zonaprop. Toda la copy viene de
   `barrios.ts` curado por David.
2. ✅ Heros con placeholder SVG cuando no hay foto. No se usan renders de terceros sin
   autorización.
3. ✅ Sin precios inventados. Los precios solo se renderizan cuando existen en
   `barrio.comercial.precioLoteDesdeUSD`; en caso contrario, "Consultar precio actualizado".
4. ✅ Sin typo "relax-óseo" — los datos usan "área de relax".
5. ✅ Sin `<form>` HTML: el newsletter usa `onClick` + state.
6. ✅ `tokko.matchByTitle` queda configurable por barrio.

---

## 8. Commits

Los hitos quedaron commiteados separados:

1. `feat(barrios): data + integración Tokko + APIs` — lib + APIs
2. `feat(barrios): componentes UI para hub y landings` — 25 componentes
3. `feat(barrios): páginas hub y landing [slug] con JSON-LD` — pages + JSON-LD
4. `feat(barrios): sitemap + tracking GA4 (filter_apply, comparador_use)` — SEO/tracking
