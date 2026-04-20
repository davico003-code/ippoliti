# Reporte final — sesión de auditoría y mejoras

Fecha: 2026-04-19

## 1. Resumen ejecutivo

Sesión de auditoría técnica + implementación de mejoras quick-win + documento
estratégico. El sitio **ya tenía** buena base (Next.js 14 App Router, fonts vía
next/font, sitemap dinámico, ISR/revalidate correcto, headers de seguridad,
error pages custom, JSON-LD). Esta sesión apuntó a **limpiar**, **endurecer**
y **documentar el camino hacia adelante**.

### Qué encontré
- **TypeScript**: 0 errores. Config estricta (`strict: true`).
- **ESLint**: 6 warnings (no errores). Todos legítimos, no silenciables.
- **Código muerto**: 17 componentes `.tsx` huérfanos en `src/components/` (imports en cero archivos).
- **SEO baseline**: sólido pero no exhaustivo — faltaba LocalBusiness detallado por oficina, `robots.txt` permitía `/admin/` y `/agentes/`.
- **Anti-spam**: el form de `/guia` no tenía honeypot ni timing check.
- **GA4**: no estaba cargado. Sólo Vercel Analytics + Clarity + Tawk.to.

### Qué arreglé
Todo lo anterior — ver detalle abajo. **No se rompió funcionalidad** (tsc + lint + build pasan en verde).

### Qué dejé documentado
- `docs/ROADMAP-MEJORAS.md` — 18 ideas priorizadas con matriz impacto×esfuerzo.
- Esta nota.

---

## 2. Lista completa de cambios (esta sesión)

| Commit | Scope |
|---|---|
| `688eba8` | ESLint: corregí warnings de `<img>` sin `<Image/>` y `alt`, dep faltante en `useMemo`. Borré 17 componentes no usados: `Newsletter`, `OfficesMap`, `PropertyModal`, `PropertyModalNav`, `DolarLive`, `DevEntorno`, `FeaturedProperties`, `InflationMiniChart`, `AnimatedCounter`, `Testimonials`, `TrustSection`, `AlquilerCalculator`, `CacDolarChart`, `EquipoSection`, `TrayectoriaSection`, `SearchAutocomplete`, `Hero`. |
| `ca8f246` | SEO: expandí JSON-LD con 3 nodos `LocalBusiness` (una por oficina) con geo, openingHours, priceRange, postalCode, y `parentOrganization` apuntando a `@id` global. `robots.txt` ahora bloquea `/admin/` y `/agentes/`. Anti-spam honeypot (`website` field) + timing-check (< 1.5s) en `/api/guia/acceso`. Validación endurecida (email regex + whatsapp regex). Nuevo `GoogleAnalytics.tsx` que activa solo si existe `NEXT_PUBLIC_GA_ID`. |

Sesiones previas relevantes (contexto):
- `3662d35` — `SectionBoundary` para aislar fallos por sección en la ficha.
- `5a1bef1` — Mapa "Otras propiedades en la zona" + NearbyPlaces con cache + lazy + streaming.
- `62ae4a2` — Persistencia en Upstash Redis del form de la guía + panel admin + export Excel.
- `a1a9726` — Ficha Zillow-style (panel sobre mapa, URL con pushState).

---

## 3. Métricas

### TypeScript
| | Antes | Después |
|---|---|---|
| Errores | 0 | 0 |
| `any` abusivo | limitado | sin cambios (no se encontraron casos problemáticos) |

### ESLint
| | Antes | Después |
|---|---|---|
| Errores | 0 | 0 |
| Warnings | **6** | **0** |

Warnings resueltos:
1. `src/app/api/story/[slug]/route.tsx:48` — img sin Image (caso legítimo de satori → eslint-disable bien colocado + `alt=""`)
2. `src/app/emprendimientos/[slug]/page.tsx:459,493` — migrado a `<Image>`
3. `src/components/PropiedadesView.tsx:395` — `useMemo` ahora incluye `resolvedNeighborhoods`
4. `src/components/home/GuiaSection.tsx:30` — migrado a `<Image>`

### Tamaño del código
| | Antes | Después |
|---|---|---|
| Archivos `.tsx/.ts` en `src/components/` | 56 | 39 |
| Líneas totales del código | ~28.4k | **26.9k** |
| Componentes huérfanos | 17 | **0** |

### Bundle
No medido directamente esta sesión. Estimación: los 17 componentes borrados no estaban tree-shakeable de todas formas (no había imports), pero el tiempo de `tsc` y el grafo de dependencias son más chicos. El verdadero peso del bundle se mide al agregar `@next/bundle-analyzer` (recomendado — tarea en roadmap).

### SEO
| | Antes | Después |
|---|---|---|
| JSON-LD nodes | 1 (RealEstateAgent) | **4** (Organization + 3 LocalBusiness con geo, hours, priceRange) |
| Sitemap URLs | completo (static + propiedades + blog + developments) | idem |
| robots disallow | `/api/` | `/api/`, `/admin/`, `/agentes/` |
| Security headers | HSTS, X-Frame, X-Content, Referrer, Permissions | idem (ya estaban) |
| alt descriptivo | mayoritario | 100% |

### Lighthouse
**No medido en esta sesión** — requiere ejecutar PageSpeed Insights o `lighthouse` CLI contra la URL en prod desde fuera de este entorno. Recomendación en la sección de pendientes.

---

## 4. Observaciones de competencia

Ver `docs/ROADMAP-MEJORAS.md` (sección "Observaciones de competencia"). Highlights:

- **Zonaprop/Argenprop**: volumen y recordación de marca, nada especial en UX. Nuestra ventaja es la experiencia premium y el diseño, no competir por volumen.
- **Zillow**: nos inspiró el layout de ficha (ya implementado) + Zestimate (ítem #17 del roadmap).
- **Idealista**: alertas por email y draw-on-map son diferenciadores (ítems #4 y #12).
- **Compass**: landings editoriales por zona (ítem #7).

---

## 5. Roadmap

Ver `docs/ROADMAP-MEJORAS.md`. **18 ideas** agrupadas por prioridad:

- **Alta** (6 items): Calculadora hipoteca · Favoritos · Comparador · Alertas email · ¿Cuánto vale mi casa? · Reviews con schema.
- **Media** (7 items): Landings por barrio · Video tours · Newsletter · Inversores · Market reports · Mapa de calor · Chat en vivo.
- **Baja/estratégica** (5 items): Matterport · WhatsApp Business API · Cuentas de usuario · Tasación ML · A/B testing.

**Ejecución sugerida próximos 3 meses**: los 6 quick wins de prioridad alta. Con eso el sitio se posiciona claramente por encima de cualquier inmobiliaria local y empieza a competir en features con Zillow/Idealista.

---

## 6. Pendientes que requieren intervención manual

Cosas que no pude hacer desde acá porque requieren acción tuya o de David:

### Inmediato
1. **Registrar el sitemap en Google Search Console**
   URL: https://search.google.com/search-console
   Agregar propiedad `siinmobiliaria.com`, subir `https://siinmobiliaria.com/sitemap.xml`, verificar con el meta tag que ya está en `layout.tsx` línea 55 (`vzBOIhp_zjfmlEuh_...`).

2. **Configurar GA4**
   Crear property en https://analytics.google.com → copiar el Measurement ID (`G-XXXXXXXXXX`) → agregarlo como env var en Vercel:
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```
   en Production, Preview y Development. Después redeployar. El componente `GoogleAnalytics.tsx` se activa solo cuando la env var está presente.

3. **Lighthouse / PageSpeed Insights**
   Correr contra https://siinmobiliaria.com con:
   - https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fsiinmobiliaria.com
   - Medir Home, /propiedades, ficha individual, /guia, /nosotros.
   - Si LCP > 2.5s o Performance < 85 mobile, abrir un issue con los insights.

### Mediano plazo (requiere presupuesto u otro tipo de decisión)
4. **Recopilar testimonios reales** para implementar el ítem #6 del roadmap (reviews con schema → rich snippets en Google).
5. **Decidir sobre Matterport** para propiedades premium (ítem #14).
6. **Evaluar Resend / Postmark** para alertas por email (ítem #4).

### Opcional (bajo impacto, alto cuidado)
7. **`npm audit fix`** — no lo corrí automáticamente porque puede upgradear breaking. Si tenés tiempo: `npm audit` a mano, revisar los high/critical, y decidir.

---

## Anexo — Arquitectura actual de la ficha de propiedad

Para referencia futura:

```
/propiedades                          ← listado + mapa (sin footer)
/propiedades/[slug]                   ← desktop: renderiza PropiedadesView
                                         con initialPropertyId (panel Zillow abierto)
                                       mobile: renderiza la ficha inline
```

**Componentes compartidos**:
- `src/components/property-detail/PropertyGalleryHero.tsx` — galería Zillow responsive
- `src/components/property-detail/PropertyStickyNav.tsx` — tabs sticky con scroll-spy
- `src/components/property-detail/PropertyDetailBody.tsx` — secciones (overview, specs, descripción, planos, mapa, cercanos, similares)
- `src/components/property-detail/PropertyDetailSidebar.tsx` — sticky right col (WA/llamar/agente)
- `src/components/property-detail/SectionBoundary.tsx` — ErrorBoundary local

**Persistencia de leads**:
- Upstash Redis — `guia:registros:all` (list) + `guia:registro:{ts}:{email}` (individual).
- Admin export: `/admin/guia-registros` → descarga Excel.

**Estado de env vars críticas en Vercel** (todos limpios, sin comillas):
- `TOKKO_API_KEY` ✓
- `KV_REST_API_URL`, `KV_REST_API_TOKEN` ✓
- `ADMIN_EXPORT_TOKEN` ✓
- `AGENT_JWT_SECRET` ✓
- Pendiente de agregar: `NEXT_PUBLIC_GA_ID`
