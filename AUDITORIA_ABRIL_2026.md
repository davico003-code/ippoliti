# Auditoría Abril 2026 — siinmobiliaria.com

## Build
- ✅ `npm run build` pasa sin errores fatales
- ⚠️ 5 warnings de lint (3 img sin next/image, 1 alt faltante, 1 missing dep en useMemo)
- ⚠️ Fetch cache falla para payloads >2MB de Tokko (no afecta funcionalidad)

## TypeScript
- ✅ `npx tsc --noEmit` pasa sin errores

## Lint
- 3 archivos con warnings:
  - `src/app/api/story/[slug]/route.tsx` — img sin next/image + falta alt
  - `src/app/emprendimientos/[slug]/page.tsx` — img sin next/image
  - `src/components/PropiedadesView.tsx` — missing dep resolvedNeighborhoods en useMemo

## Componentes huérfanos (14)
No importados en ningún archivo:
1. AlquilerCalculator.tsx
2. AnimatedCounter.tsx
3. CacDolarChart.tsx
4. DevEntorno.tsx
5. DolarLive.tsx
6. EquipoSection.tsx
7. GuiaSection.tsx
8. InflationMiniChart.tsx
9. Newsletter.tsx
10. OfficesMap.tsx
11. SearchAutocomplete.tsx
12. Testimonials.tsx
13. TrayectoriaSection.tsx
14. TrustSection.tsx

## Lib huérfanos (2)
1. `src/lib/property-data.ts` — fue para el modal intercepting (removido)
2. `src/lib/zonas-poligonos.ts` — datos de polígonos no usados

## Console.logs en producción (37)
- `aprobacion-blog/route.ts`: 13 (logs de diagnóstico del webhook Twilio)
- `cron/informes/route.ts`: 5 (console.error en catch blocks)
- `twilio-client.ts`: 2
- Resto: catch blocks legítimos

## Archivos pesados en public/ (>500KB)
1. `public/nosotros/LDS.png` — **11 MB** (!!!)
2. `public/LDS.jpg` — 2.7 MB
3. `public/nosotros/LAURASUSANADAVID.jpeg` — 691 KB
4. `public/casa-cadaques-openhaus.png` — 571 KB

## Dependencia no usada
- `framer-motion` — instalada pero no importada

## Rutas potencialmente huérfanas
- `src/app/api/test-twilio/` — endpoint de debug
- `src/app/api/admin/unpublish-villa-flores/` — one-shot ya usado
- `src/app/seleccion/[id]/` — directorio sin page (posible migración incompleta)

## Componentes similares/duplicados
- Hero: Hero.tsx, HeroSearch.tsx, HeroVideo.tsx (Hero.tsx posiblemente orphan)
- PropertyModal.tsx + PropertyModalNav.tsx (sin uso desde que se removieron intercepting routes)
- FeaturedProperties.tsx (orphan, reemplazado por FeaturedPropertiesSection inline en page.tsx)
