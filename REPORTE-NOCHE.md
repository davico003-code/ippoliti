# REPORTE NOCHE — 17 abril 2026

## Commits realizados

```
2da1cf1 fix(home): ocultar navbar global en mobile home (HeroMobile tiene su propio header)
e9e7cd9 fix(home): usar logo-blanco.png directo en vez de filtro CSS sobre LOGO_HORIZONTAL
0fe38be fix(home): ocultar chat flotante y footer global en mobile home
c170b9e fix(home): badges variados en SeleccionCarousel en vez de todas EXCLUSIVA
1cf2509 fix(home): scroll completo funcional + Safari 3D rendering fix
986e492 fix(home): badges reflejan operation_type real de Tokko
```

## Problemas resueltos

### Problema 1 — Chat flotante
**Qué encontré**: `FloatingWhatsApp.tsx` renderiza un botón `fixed bottom-6 right-6 z-50` en todas las rutas excepto fichas de propiedad. No tenía exclusión para la home.

**Cómo lo arreglé**: Agregué `${pathname === '/' ? 'hidden md:flex' : ''}` al className. En home mobile: oculto. En home desktop: visible. En otras rutas: sin cambios.

También encontré `ScrollToTop.tsx` (fixed bottom-24 right-5) pero ese solo aparece con scroll > 400px y no interfiere.

`TawkTo.tsx` tiene IDs placeholder (XXXX) → retorna null. No interfiere.

### Problema 2 — Scroll roto
**Qué encontré**: Dos causas:
1. **Footer global duplicado**: El `<Footer />` en `layout.tsx` se renderizaba debajo del `<FooterMobile />` del page mobile, creando espacio invisible que confundía el layout.
2. **FloatingWhatsApp fixed z-50**: En Safari mobile, el botón fixed con z-index alto interfería con el scrolling del contenedor padre.

**Cómo lo arreglé**:
- Creé `FooterWrapper.tsx` (client component) que lee `pathname` y renderiza el Footer global con `hidden md:block` cuando estamos en la home. El FooterMobile dentro de page.tsx se encarga del mobile.
- El fix del FloatingWhatsApp del punto 1 también contribuye.
- Agregué `WebkitPerspective` y `transformStyle: preserve-3d` a la escena 3D de GuiaSection para Safari.

**Verificación**: Las 12 secciones están en el HTML SSR (confirmado con curl + parser Python).

### Problema 3 — Badges
**Qué estaba hardcodeado**: Un sistema demo con `DEMO_BADGES` array que ciclaba entre 8 variantes (BAJÓ DE PRECIO, A ESTRENAR, OPEN HOUSE, EXCLUSIVA, OPORTUNIDAD, NUEVO, VENTA, ALQUILER) por posición en el array. Como todas las featured properties de Tokko son `is_starred_on_web = true`, antes todas mostraban "EXCLUSIVA".

**Qué cambié**: Eliminé todo el sistema demo (BadgeVariant type, BADGE_CONFIG, DEMO_BADGES, getBadgeFromProperty). Reemplazé por `getBadge(p)` simple que lee `getOperationType(p)`:
- Sale → "VENTA" (verde #1A5C38)
- Rent → "ALQUILER" (azul #2563eb)

Las 8 featured properties actuales en Tokko son todas de venta → todas muestran "VENTA". Correcto según los datos reales.

## Observaciones visuales

1. El glow verde animado del GuiaSection (mockup 3D) se ve bien pero en pantallas muy pequeñas (iPhone SE 320px) la escena queda apretada — los textos del iPad y iPhone son muy chicos para leer. Esto es intencional del diseño (es decorativo, no funcional).
2. La foto de la sección Confianza es un placeholder Unsplash (familia genérica). Se ve bien compositivamente pero no es la familia Flores real.
3. Las fotos de las 3 oficinas también son Unsplash. Se ven profesionales pero no son las oficinas reales.
4. El badge "VENTA" aparece 8 veces (todas featured son venta). Cuando haya alquileres destacados se verá variedad naturalmente.

## Decisiones pendientes

1. **Sistema de badges avanzado**: El usuario dijo que lo implementa en otra iteración. No se tocó. Cuando quiera badges tipo OPORTUNIDAD, OPEN HOUSE, etc., hay que conectar a campos de Tokko que hoy no usamos.
2. **Modal de acceso a la guía**: El modal existe y el backend funciona (POST /api/guia/acceso → JWT cookie), pero no se testeó end-to-end porque no hay Tokko API key para crear leads en esta sesión dev.
3. **Merge a main**: Todo está en rama `rediseno-home-mobile-zillow`. El usuario mergea cuando revise.

## Estado final del build

**PASS** — Build completo sin errores.

```
+ First Load JS shared by all: 88.1 kB
○ (Static) prerendered as static content
● (SSG) prerendered as static HTML
ƒ (Dynamic) server-rendered on demand
```

Warnings preexistentes (no relacionados con estos cambios):
- 2× `<img>` sin next/image en emprendimientos/[slug]
- 1× useMemo missing dep en PropiedadesView

## TODOs originales aún pendientes

| Item | Archivo | Descripción |
|------|---------|-------------|
| Fotos reales oficinas | ConfianzaSection.tsx | Reemplazar Unsplash por /public/oficinas/*.jpg |
| Foto familia Flores | ConfianzaSection.tsx | Reemplazar Unsplash por foto real |
| Fotos emprendimientos | ProyectosCarousel.tsx | Reemplazar fallbacks Unsplash |
| Logo blanco SVG | HeroMobile, FooterMobile | Usa logo-blanco.png — un SVG sería más nítido |
| TOKKO_API_KEY | api/guia/acceso | Lead se crea solo si la key está en env |
| AGENT_JWT_SECRET | api/guia/* | Reutiliza la existente de agentes |
| BLOB_READ_WRITE_TOKEN | Vercel Blob | No conectado, blog dinámico degrada a hardcoded |
| Foto hero | HeroMobile.tsx | Usa /hero-home.jpg existente — verificar si es la deseada |
