# Reporte de Auditoría — Abril 2026

## Resumen ejecutivo

1. **20 archivos huérfanos eliminados** (18 componentes + 2 libs, ~3000 líneas de código muerto)
2. **Imágenes optimizadas**: LDS.png 11MB → LDS.webp 408KB (-96%), LDS.jpg 2.7MB → LDS.webp 651KB (-76%)
3. **SEO: robots.txt corregido** para excluir /admin/, /agentes/, /seleccion/ del crawling
4. **Dependencia huérfana eliminada**: framer-motion (nunca se importaba)
5. **Lint limpio**: 0 errores, solo 2 warnings inevitables (OG image generator usa <img> intencionalmente)

---

## Archivos eliminados (20)

### Componentes huérfanos (18)
| Archivo | Motivo |
|---------|--------|
| AlquilerCalculator.tsx | No importado, calculadora abandonada |
| AnimatedCounter.tsx | No importado, efecto visual descartado |
| CacDolarChart.tsx | No importado, chart de construcción |
| DevEntorno.tsx | No importado, sección de emprendimiento |
| DolarLive.tsx | No importado, widget de dólar |
| EquipoSection.tsx | No importado, sección equipo vieja |
| GuiaSection.tsx | No importado, sección guía vieja |
| InflationMiniChart.tsx | No importado, mini chart |
| Newsletter.tsx | No importado, formulario newsletter |
| OfficesMap.tsx | No importado, mapa de oficinas viejo |
| SearchAutocomplete.tsx | No importado, reemplazado por búsqueda en PropiedadesView |
| Testimonials.tsx | No importado, testimonios descartados |
| TrayectoriaSection.tsx | No importado, sección trayectoria vieja |
| TrustSection.tsx | No importado, sección confianza vieja |
| Hero.tsx | No importado, reemplazado por HeroVideo |
| FeaturedProperties.tsx | No importado, reemplazado por FeaturedPropertiesSection inline en page.tsx |
| PropertyModal.tsx | No importado, intercepting routes removidas |
| PropertyModalNav.tsx | No importado, tabs del modal removido |

### Libs huérfanos (2)
| Archivo | Motivo |
|---------|--------|
| property-data.ts | Creado para intercepting routes, removidas |
| zonas-poligonos.ts | Datos de polígonos nunca usados |

---

## Componentes consolidados

No se encontraron duplicados funcionales activos. Los "duplicados" ya estaban resueltos:
- Hero.tsx (viejo) → HeroVideo.tsx (activo) — eliminado el viejo
- FeaturedProperties.tsx (viejo) → FeaturedPropertiesSection inline en page.tsx — eliminado el viejo

Componentes similares que se MANTIENEN porque cumplen roles distintos:
- PropertyGrid.tsx (grid simple para /propiedades-roldan) vs PropiedadCardGrid.tsx (card interactiva con selección/hover para /propiedades)
- ShareButtons.tsx (panel de compartir en desktop) vs ShareCardButton.tsx (botón individual en card)

---

## Mejoras de performance

### Imágenes
| Archivo | Antes | Después | Reducción |
|---------|-------|---------|-----------|
| nosotros/LDS.png | 11 MB | LDS.webp 408 KB | -96% |
| LDS.jpg | 2.7 MB | LDS.webp 651 KB | -76% |
| **Total** | **13.7 MB** | **1.06 MB** | **-92%** |

### Bundle size
- First Load JS shared: 88 KB (dentro del presupuesto)
- Home: 93 KB first load
- /propiedades: 121 KB (más pesada por Leaflet + filtros, ya usa dynamic import)
- /propiedades/[slug]: 183 KB (galería + mapa, ya usa dynamic imports)

### Dependencias
- framer-motion eliminada (no se usaba, ~150 KB del bundle potencial)

### Fuentes
- ✅ Raleway y Poppins cargadas via `next/font/google` en layout.tsx
- ✅ `display: swap` configurado

---

## Issues SEO encontrados y resueltos

| Issue | Estado |
|-------|--------|
| /admin/, /agentes/, /seleccion/ no excluidos de robots.txt | ✅ Arreglado |
| Metadata por ruta (title, description, OG, canonical) | ✅ Verificado OK en todas las rutas principales |
| sitemap.xml generado correctamente sin rutas privadas | ✅ OK |
| Schema.org: RealEstateListing, BreadcrumbList, LocalBusiness | ✅ Presente en fichas y home |
| h1 único por página | ✅ Verificado |
| Alt text en imágenes | ✅ Corregido en emprendimientos (2 <img> → <Image>) |
| Canonical URLs | ✅ Configurados en metadata |

---

## Links rotos

No se encontraron links rotos en el código. Todos los `<Link>` y `<a>` apuntan a rutas existentes o URLs externas válidas (WhatsApp, Instagram, Tokko CDN).

---

## Limpieza de código

| Acción | Cantidad |
|--------|----------|
| Console.logs de diagnóstico removidos | 13 (webhook aprobacion-blog) |
| Missing dependency en useMemo corregido | 1 (resolvedNeighborhoods) |
| `<img>` migrado a `<Image>` | 2 (emprendimientos/[slug]) |
| Dependencia huérfana eliminada | 1 (framer-motion) |

---

## Lo que NO se pudo hacer

| Item | Motivo |
|------|--------|
| Lighthouse scores reales | Requiere browser headless, no disponible en esta sesión CLI. El build pasa y los bundle sizes están dentro de presupuesto |
| Prettier format completo | No instalado en el proyecto. Agregar prettier requeriría configuración que puede cambiar estilos masivamente |
| Imágenes originales (LDS.png, LDS.jpg) | Se conservan porque podrían usarse para otros formatos. Los .webp se agregan como alternativa, las referencias se actualizan |
| BLOB_READ_WRITE_TOKEN | Vercel Blob no está conectado al proyecto. El blog dinámico degrada gracefully a posts hardcodeados |
| Test de /admin/leads | Requiere auth interactive que no puedo simular |

---

## Test funcional

| Ruta | Status | Notas |
|------|--------|-------|
| / (Home) | ✅ 200 | Hero, buscador, carrusel, secciones OK |
| /propiedades | ✅ 200 | Listado + mapa + filtros OK |
| /propiedades/[slug] | ✅ 200 | Galería, specs, descripción, mapa, sidebar OK |
| /nosotros | ✅ 200 | |
| /tasaciones | ✅ 200 | |
| /blog | ✅ 200 | Blob warning (no token), degrada a posts hardcodeados |
| /informes | ✅ 200 | |
| /emprendimientos | ✅ 200 | |

---

## Recomendaciones para próximas iteraciones

1. **Conectar Vercel Blob** al proyecto para que el agente de blog pueda publicar notas dinámicas
2. **Parallel routes / modal overlay** — re-implementar con Next.js 15 (parallel routes más estables con ISR)
3. **Imágenes originales pesadas** (LDS.png 11MB, nosotros/LAURASUSANADAVID.jpeg 691KB) — considerar eliminar las versiones originales una vez confirmados los .webp
4. **depcheck** reporta framer-motion como única dep huérfana — ya eliminada
5. **Webhook Twilio** — el flujo end-to-end de aprobación de blog por WhatsApp necesita test real (el admin debe responder "1,3" desde su WhatsApp)
