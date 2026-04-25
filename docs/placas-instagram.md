# Placas para historias de Instagram — Documentación de implementación

> Fecha de relevamiento: 2026-04-25 · Repo: `ippoliti` · Branch público: siinmobiliaria.com
> Alcance: punta a punta de la feature "Crear placa Instagram" desde la ficha de propiedad.

---

## Resumen ejecutivo

- **Generación 100% client-side con HTML5 `<canvas>`** (no `@vercel/og`, no `html2canvas`). El render lo hace `StoryPlateMulti.tsx` dibujando manualmente con `CanvasRenderingContext2D` a 1080×1920 px.
- **Página dedicada** `/propiedades/[slug]/placa` con flujo de 3 pasos: el server hace SSR de los datos Tokko → el cliente muestra grid de fotos para elegir 1 o 2 → preview en vivo (`PlacaPreview`) → botón "Descargar placa" que dispara el render canvas y la descarga.
- **Dos variantes visuales** decididas automáticamente por cantidad de fotos seleccionadas: **Editorial Cover** (0–1 foto, full-bleed con overlay) y **Split Card** (2 fotos, banda blanca central).
- **Entry point único**: botón circular con gradiente Instagram en el `MobileStickyBar` (mobile) y botón "Placa" en `ShareButtons` dentro del `PropertyDetailSidebar` (desktop). Ambos linkean a `/propiedades/[slug]/placa`.
- **Sin tracking**: ni GA4 ni Meta Pixel registran el click ni la descarga. La descarga usa Web Share API (cuando el navegador la soporta y el archivo es shareable) con fallback a `<a download>` blob.
- **Existe** un endpoint `/api/story/[slug]` que genera la misma placa server-side con `next/og` (`ImageResponse`), pero **no está cableado a ningún `og:image`** — código vivo huérfano (legacy / desuso).

---

## Árbol de archivos involucrados

```
src/
├── app/
│   └── propiedades/[slug]/
│       ├── page.tsx                         → ficha de propiedad (mobile + desktop)
│       └── placa/
│           └── page.tsx                     → server component: fetch Tokko + render <PlacaSelectorClient>
│   └── api/story/[slug]/
│       └── route.tsx                        → ImageResponse OG (no cableado, ver §7)
├── components/
│   ├── MobileStickyBar.tsx                  → entry mobile: botón circular Instagram
│   ├── ShareButtons.tsx                     → entry desktop: botón "Placa" en sidebar
│   ├── property-detail/
│   │   └── PropertyDetailSidebar.tsx        → consume <ShareButtons placaHref=...>
│   ├── PlacaSelectorClient.tsx              → grid de fotos + preview + botón descarga
│   ├── PlacaPreview.tsx                     → preview visual JSX (no canvas; usa cqw)
│   └── StoryPlateMulti.tsx                  → motor canvas 1080×1920 + Web Share / blob download
├── lib/
│   ├── tokko.ts                             → helpers: getPropertyById, getIdFromSlug,
│   │                                          formatPrice, getOperationType, getTotalSurface,
│   │                                          getLotSurface, translatePropertyType
│   └── analytics.ts                         → GA4/FB events (sin event de placa)
└── app/layout.tsx                           → Raleway + Poppins via next/font/google
public/
└── logo-si-white.png                        → logo dibujado en cada placa
```

---

## 1. Entry point

### 1.a Mobile — `MobileStickyBar.tsx`

Posición: barra inferior fija solo en mobile (`md:hidden`). Es el tercer botón de los cuatro de la barra (Solicitá visita / Chat WhatsApp / **Placa** / Compartir).

`src/components/MobileStickyBar.tsx:109-125`:

```tsx
{/* 3. Placa (Instagram) — link a la página de selección de fotos */}
<div className="flex flex-col items-center" style={{ gap: 2 }}>
  <Link
    href={`/propiedades/${slug}/placa`}
    aria-label="Crear placa Instagram"
    className="flex items-center justify-center"
    style={{
      width: 46,
      height: 46,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    }}
  >
    <Instagram className="w-[18px] h-[18px] text-white" />
  </Link>
  <span style={{ fontSize: 9, fontWeight: 700, color: '#e04e8a' }}>Placa</span>
</div>
```

- **Texto:** label "Placa" debajo, ícono `Instagram` (lucide-react) sobre disco con gradiente IG (5 stops de naranja → magenta).
- **Acción:** `Link` Next a `/propiedades/{slug}/placa`. **No** ejecuta evento de tracking.
- **Breakpoint:** wrapper padre tiene `md:hidden`, así que no se ve en desktop.

Se monta desde `src/app/propiedades/[slug]/page.tsx:256`:

```tsx
<MobileStickyBar
  whatsappUrl={whatsappUrl}
  slug={params.slug}
  title={property.publication_title || property.address}
  propertyId={property.id}
  propertyTitle={property.publication_title || property.address}
/>
```

### 1.b Desktop — `ShareButtons.tsx` dentro del sidebar

Posición: bloque "Compartir propiedad" del `PropertyDetailSidebar` (panel derecho del layout Zillow-like de la ficha desktop). Junto al botón WhatsApp y al botón Copiar.

`src/components/property-detail/PropertyDetailSidebar.tsx:79-83`:

```tsx
<ShareButtons
  slug={slug}
  title={property.publication_title || address}
  placaHref={`/propiedades/${slug}/placa`}
/>
```

`src/components/ShareButtons.tsx:76-89`:

```tsx
{/* Placa Instagram — solo si el caller proveyó la URL */}
{placaHref && (
  <Link
    href={placaHref}
    style={{
      ...btnStyle,
      background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
      color: '#fff',
    }}
  >
    <Instagram size={16} />
    Placa
  </Link>
)}
```

- **Renderizado condicional**: solo aparece si `placaHref` está definido. En `/emprendimientos/[slug]` el botón se omite (la feature todavía no aplica a emprendimientos).
- Mismo gradiente IG, ícono Instagram + label "Placa".

### 1.c Variantes de placa

Solo **una placa**, formato historia 9:16 (1080×1920). El layout interno cambia automáticamente según fotos:

| Fotos seleccionadas | Layout                             |
| ------------------- | ---------------------------------- |
| 0                   | Editorial Cover sin foto (verde sólido `#0d1a12` + textos) |
| 1                   | Editorial Cover con foto full-bleed |
| 2                   | Split Card (foto arriba, banda blanca central, foto abajo) |

No hay variante 1:1 para post, ni 4:5, ni stories sin overlay.

---

## 2. Generación de la placa

### 2.a Server-side: hidratación de datos Tokko

`src/app/propiedades/[slug]/placa/page.tsx` es **Server Component**. Hace `getPropertyById(id)` contra Tokko, normaliza campos y pasa props al cliente:

```tsx
// src/app/propiedades/[slug]/placa/page.tsx:35-93
export default async function PlacaPage({ params }: Props) {
  const id = getIdFromSlug(params.slug)
  if (isNaN(id)) notFound()

  let property: TokkoProperty
  try {
    property = await getPropertyById(id)
  } catch (e) {
    if (e instanceof Error && e.message.includes('not found')) notFound()
    throw e
  }

  const photos: PlacaPhoto[] = (property.photos || [])
    .filter(p => !p.is_blueprint)                 // descarta planos
    .sort((a, b) => a.order - b.order)            // orden Tokko
    .map(p => ({ thumb: p.thumb || p.image, full: p.image }))

  const title = property.publication_title || property.fake_address || property.address || 'Propiedad'
  const price = formatPrice(property)
  const operation = getOperationType(property)
  const propertyType = translatePropertyType(property.type?.name)
  const area = getTotalSurface(property)
  const lotSurface = getLotSurface(property)
  const rooms = property.suite_amount || property.room_amount || 0
  const bathrooms = property.bathroom_amount || 0
  const parking = property.parking_lot_amount || 0
  const city = property.location?.name || null

  // Match barrio: el más largo que aparezca como palabra completa en la dirección
  const addrText = property.fake_address || property.address || ''
  const sortedDivs = [...(property.location?.divisions ?? [])].sort((a, b) => b.name.length - a.name.length)
  const neighborhood = sortedDivs.find(d => {
    const esc = d.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b${esc}\\b`, 'i').test(addrText)
  })?.name || null

  const locationLabel = [neighborhood, city].filter(Boolean).join(' · ') || 'Propiedad'

  return <PlacaSelectorClient slug={params.slug} photos={photos} ... />
}
```

- `revalidate = 21600` (6 h ISR), `dynamicParams = true`, `generateStaticParams: () => []` → on-demand SSG.
- `generateMetadata` setea `robots: { index: false, follow: false }` para que Google no indexe la página de creación.

### 2.b Client-side: render canvas

`src/components/StoryPlateMulti.tsx` es el motor. Funciones clave:

**Dispatcher por cantidad de fotos** (`StoryPlateMulti.tsx:508-534`):

```tsx
const generate = useCallback(async (): Promise<Blob | null> => {
  const canvas = canvasRef.current
  if (!canvas) return null
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  canvas.width = W   // 1080
  canvas.height = H  // 1920

  await ensureFonts()   // espera carga de fuentes Raleway/Poppins ya inyectadas por next/font

  const [photos, logo] = await Promise.all([
    Promise.all((props.photos || []).slice(0, 2).map(url => tryLoadImage(url))),
    tryLoadImage(LOGO_URL),    // '/logo-si-white.png'
  ])

  const validPhotos = photos.filter((p): p is HTMLImageElement => p !== null)

  if (validPhotos.length >= 2) {
    await drawSplitCard(ctx, props, validPhotos[0], validPhotos[1], logo)
  } else {
    const single = validPhotos[0] || null
    await drawEditorialCover(ctx, props, single, logo)
  }

  return new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b), 'image/png'))
}, [props])
```

**Carga forzada de fuentes** antes del primer trazo (`StoryPlateMulti.tsx:185-195`):

```ts
async function ensureFonts() {
  try { await document.fonts.ready } catch { /* ignore */ }
  const loads = [
    '400 34px Poppins', '400 52px Poppins', '600 32px Poppins',
    '700 48px Poppins', '700 52px Poppins', '700 120px Poppins', '700 140px Poppins',
    '300 52px Poppins',
    '400 40px Raleway', '700 24px Raleway', '700 40px Raleway',
    '700 100px Raleway', '800 115px Raleway', '800 95px Raleway', '800 80px Raleway',
  ]
  await Promise.all(loads.map(f => document.fonts.load(f).catch(() => null)))
}
```

**Helpers internos relevantes** (sin pegar todo el archivo):

| Helper                   | Línea     | Función |
| ------------------------ | --------- | ------- |
| `loadImage` / `tryLoadImage` | 34-46 | Carga `Image` con `crossOrigin='anonymous'` (necesario para no taintear el canvas). |
| `drawCover`              | 48-58     | Hace `cover` de una foto en un rect sin distorsión (clip + scale max). |
| `wrapText`               | 60-75     | Word-wrap simple basado en `ctx.measureText`. |
| `drawPill`               | 77-110    | Pill (chip) `solid-green`/`ghost-light`/`ghost-dark` con border radius 999. |
| `setLetterSpacing`       | 112-116   | Setea `ctx.letterSpacing` (Chrome 99+/Safari 16+). Try-catch porque TS no lo tipa. |
| `buildSpecs`             | 125-136   | Arma la línea de features (`m²`, `dorm`, `baños`, `coch.`). Si es terreno, oculta dorm/baños/coch. |
| `drawFeaturesLine`       | 138-163   | Pinta los specs con separador `·` y dos pesos (700 número / 400 unidad). |
| `drawFooterRow`          | 165-183   | Pinta "David Flores / Mat. N° 0621" izq y "@inmobiliaria.si / Consultá por DM" der. |
| `buildPillTexts`         | 197-205   | Devuelve `[OPERACION, TIPO, BARRIO/CIUDAD]`. Mapea `temporary` → "TEMPORARIO", `rent` → "ALQUILER", default "VENTA". |
| `drawEditorialCover`     | 207-345   | Layout 1: foto full-bleed, gradiente, pills + título + features + divisor + precio + divisor + footer (todo en la zona inferior con `cy = H - PAD - totalBlockH`). |
| `drawSplitCard`          | 347-502   | Layout 2: foto1 (0–960), banda blanca (875 + altura dinámica), foto2 (1152–1920) con gradiente y bloque precio/footer encima. |

### 2.c Flujo punta a punta

```
[Click "Placa" en MobileStickyBar / ShareButtons]
         │
         ▼
Next router → GET /propiedades/{slug}/placa
         │
         ▼
[Server Component] PlacaPage
   • getIdFromSlug(slug) → id Tokko
   • getPropertyById(id) → property
   • Filtra fotos no blueprint, ordena, mapea {thumb,full}
   • Calcula price/op/type/area/etc + barrio (regex sobre fake_address)
   • Renderiza <PlacaSelectorClient ...props/>
         │
         ▼
[Client] PlacaSelectorClient
   • useState<string[]>([]) selected (max 2)
   • Grid de thumbs → onClick toggle (descarta si ya hay 2)
   • Renderiza <PlacaPreview/> (DOM puro, JSX con cqw, NO canvas)
   • Renderiza <StoryPlateMulti ...props photos={selected} disabled={selected.length===0}/>
         │
         ▼
[Click "Descargar placa"]
   handleDownload (StoryPlateMulti.tsx:536)
   ├─ generate() → canvas 1080×1920
   │   • ensureFonts() (espera document.fonts)
   │   • tryLoadImage por cada URL (con CORS)
   │   • dispatcher → drawSplitCard | drawEditorialCover
   │   • canvas.toBlob('image/png') → Blob
   ├─ new File([blob], `placa-${slug}.png`, 'image/png')
   ├─ if (navigator.share && navigator.canShare({files}))
   │     → navigator.share({files,title:'Placa Instagram'})  ← iOS/Android
   └─ else
        → URL.createObjectURL → <a download> click → revokeObjectURL
```

---

## 3. Datos consumidos (Tokko → placa)

Pipeline: **`PlacaPage` (server)** → props → **`PlacaSelectorClient`** → spread `sharedPlateProps` → **`StoryPlateMulti`** + **`PlacaPreview`**.

| Campo Tokko                                | Helper / acceso                                  | Uso en placa                                                | Fallback |
| ------------------------------------------ | ------------------------------------------------ | ----------------------------------------------------------- | -------- |
| `operations[0].prices[0].price` + `currency` | `formatPrice(property)`                        | Texto grande de precio (Editorial: 140 px / Split: 120 px) | "Consultar" |
| `operations[0].operation_type`             | `getOperationType()` + `buildPillTexts`          | Pill verde sólido (VENTA / ALQUILER / TEMPORARIO)           | "VENTA"  |
| `type.name`                                | `translatePropertyType()`                        | Pill ghost (CASA, DEPARTAMENTO, TERRENO, …)                 | (omitida si vacía) |
| `publication_title` ‖ `fake_address` ‖ `address` | inline                                       | Título grande Raleway 800/700                               | "Propiedad" |
| `total_surface` ‖ `roofed_surface` ‖ `surface` | `getTotalSurface(property)`                     | Spec `{n} m²`                                               | omitida |
| `surface` (terreno)                        | `getLotSurface(property)`                        | Spec `{n} m² lote` (omitida si igual a area o si es terreno) | omitida |
| `suite_amount` ‖ `room_amount`             | inline (`||`)                                    | Spec `{n} dorm` (omitida si terreno)                        | omitida |
| `bathroom_amount`                          | inline                                           | Spec `{n} baño(s)`                                          | omitida |
| `parking_lot_amount`                       | inline                                           | Spec `{n} coch.` (omitida si terreno)                       | omitida |
| `location.name`                            | inline                                           | Pill ghost (placeLabel) si no hay barrio. También en `locationLabel` del header. | omitida |
| `location.divisions[]`                     | regex `\b{name}\b` sobre `fake_address`/`address` | Pill ghost (preferido sobre city). Si nada matchea, usa city. | omitida |
| `photos[] (is_blueprint=false)`            | sort por `order`, map `{thumb, full}`            | Grid del selector (thumb) + canvas (full URL, las dos primeras seleccionadas) | "Esta propiedad no tiene fotos disponibles" + Editorial Cover sin foto |
| —                                          | `LOGO_URL = '/logo-si-white.png'`                | Logo dibujado top-left (h=75 px)                            | omitido si falla la carga |

Notas:
- **No se pasan IDs de propiedad** al canvas — `slug` se usa solo para nombrar el archivo descargado (`placa-{slug}.png`).
- **El selector cap es 2 fotos**: si el usuario hace click en una 3ra, el botón queda `disabled` con `opacity:0.4` (`PlacaSelectorClient.tsx:142,154`).

---

## 4. Diseño visual

### 4.a Dimensiones y layout

- **Canvas**: 1080 × 1920 px (formato 9:16 IG Story).
- **Padding global**: `PAD = 75` px.

#### Editorial Cover (`drawEditorialCover` — 1 o 0 fotos)

```
┌──────────────────────────────────────────┐  y=0
│  [logo SI 75px]                          │  PAD=75
│                                          │
│         (foto full-bleed con cover       │
│          + gradiente 0/18/38/65/100%)    │
│                                          │
│                                          │
│  [pill VENTA] [pill TIPO] [pill BARRIO]  │
│  (recalculado: cy = H - PAD - totalH)    │
│  Título Raleway 800 (115/95/80 según     │
│  cantidad de líneas, hasta 3)            │
│  120 m²  ·  3 dorm  ·  2 baños  · 1 coch.│
│  ──────────────────────────────────────  │
│  PRECIO                                  │
│  USD 350.000   ← Poppins 700 · 140px     │
│  ──────────────────────────────────────  │
│  David Flores       @inmobiliaria.si     │
│  Mat. N° 0621       Consultá por DM      │
└──────────────────────────────────────────┘  y=1920
```

- Gradiente vertical: `rgba(0,0,0,.30)` 0% → transparente 18-38% → `rgba(0,0,0,.55)` 65% → `rgba(0,0,0,.92)` 100%.
- Color base sin foto: `#0d1a12`.
- Sombra del título: `rgba(0,0,0,0.45)` blur 30 offset y=4.
- Title letter-spacing: −4 px. Price letter-spacing: −4.5 px.

#### Split Card (`drawSplitCard` — 2 fotos)

```
┌──────────────────────────────────────────┐  y=0
│ [logo SI]   foto 1 (cover en 0..960)     │
│             + sombrita superior          │
├──────────────────────────────────────────┤  y=875 (banda blanca)
│  [pill VENTA verde] [pill TIPO ghost-dark]│
│  [pill BARRIO ghost-dark]                 │
│  Título Raleway 700 (100/85/72)           │
│  120 m²  · 3 dorm · 2 baños               │
├──────────────────────────────────────────┤  y=1152
│  foto 2 (cover en 1152..1920)            │
│  + gradiente oscuro inferior             │
│                                          │
│  PRECIO                                  │
│  USD 350.000  ← Poppins 700 · 120px      │
│  ──────────────────────────────────────  │
│  David Flores       @inmobiliaria.si     │
│  Mat. N° 0621       Consultá por DM      │
└──────────────────────────────────────────┘  y=1920
```

- Banda blanca: shadow `rgba(0,0,0,0.22)` blur 24 offset y=8.
- Pills en banda usan `ghost-dark` (transparente + borde negro 0.2) excepto la primera que sigue siendo verde.

### 4.b Tipografías

| Familia  | Pesos usados             | Dónde se cargan                                | Cómo se cargan en canvas |
| -------- | ------------------------ | ---------------------------------------------- | ------------------------ |
| Raleway  | 400, 700, 800            | `src/app/layout.tsx:5-10` (`next/font/google`) — `--font-raleway` | `ensureFonts()` hace `document.fonts.load('800 115px Raleway')` antes de dibujar |
| Poppins  | 300, 400, 600, 700       | `src/app/layout.tsx:12-17` (`next/font/google`) — `--font-poppins` | `ensureFonts()` |
| Lora, Playfair Display | (no usadas en placa) | layout.tsx (otras secciones)                | n/a                      |

> **Discrepancia con tokens del sistema de diseño**: la memoria documenta `Fraunces`, `Inter`, `Montserrat`, `Orbitron` como tipografías de marca, pero **las placas no las usan** — solo Raleway + Poppins (las que `next/font` ya inyecta para todo el sitio). El "logo SI" del badge en `/api/story` (no en la placa real) usa `'sans-serif'` genérico, no Orbitron.

### 4.c Paleta aplicada

| Token              | Hex / rgba                       | Dónde aparece en la placa |
| ------------------ | -------------------------------- | ------------------------- |
| Verde marca        | `#1A5C38`                        | Pill `solid-green` (operación) |
| Fondo "fallback"   | `#0d1a12`                        | Color base si la foto falla / `<canvas>` antes del `drawCover` / fondo split |
| Blanco             | `#fff`                           | Texto principal sobre foto, banda split |
| Negro suave        | `#1a1a1a`                        | Texto sobre la banda blanca del split |
| Sombras            | `rgba(0,0,0,0.22)` … `0.92`      | Gradientes, sombras de texto y banda |
| Whites translúcidos | `0.08 / 0.20 / 0.25 / 0.28 / 0.35 / 0.45 / 0.55 / 0.7 / 0.75` | Pills ghost-light, divisores, separadores `·`, label "PRECIO", footer secondary |

> **No se usan** los tokens `Gold #B8935A` ni `Paper #FAF7F2` que figuran en la memoria de marca. Solo verde marca + escala de blancos/negros translúcidos sobre foto. El `Paper` sí aparece en el background de `PlacaSelectorClient` (la página intermedia), no en la placa generada.

### 4.d Logo "SI INMOBILIARIA"

- En la **placa real** (canvas): se dibuja la imagen `public/logo-si-white.png` con `drawImage` a altura 75 px (`StoryPlateMulti.tsx:227-230` / `383-387`). No se renderiza ningún rectángulo verde con texto Orbitron+Montserrat — eso vive solo en el OG `/api/story` huérfano:

  `src/app/api/story/[slug]/route.tsx:210-212`:
  ```tsx
  <div style={{ width: '88px', height: '88px', borderRadius: '16px', background: '#1A5C38' }}>
    <span style={{ color: '#fff', fontSize: '36px', fontWeight: 800, fontFamily: 'sans-serif' }}>SI</span>
  </div>
  ```

- En la **preview** DOM (`PlacaPreview.tsx:135-139, 222-226`): mismo PNG con `<img src="/logo-si-white.png">` posicionado `top:4% left:7% height:4%`.

---

## 5. Descarga en mobile/desktop

`StoryPlateMulti.tsx:536-559`:

```tsx
const handleDownload = useCallback(async () => {
  if (generating || props.disabled) return
  setGenerating(true)
  try {
    const blob = await generate()
    if (!blob) return
    const file = new File([blob], `placa-${props.slug}.png`, { type: 'image/png' })
    const nav = navigator as Navigator & { canShare?: (d?: ShareData) => boolean }
    if (nav.share && nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: 'Placa Instagram' })
        return
      } catch { /* user cancelled or permission denied; fall through */ }
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `placa-${props.slug}.png`
    a.click()
    URL.revokeObjectURL(url)
  } finally {
    setGenerating(false)
  }
}, [generate, generating, props.disabled, props.slug])
```

Comportamiento por plataforma:

| Plataforma               | Path elegido                                   | Resultado UX |
| ------------------------ | ---------------------------------------------- | ------------ |
| iOS Safari (16+)         | `navigator.share({files})` (canShare ✓)        | Sheet nativo de iOS → "Guardar imagen" deja la placa en Fotos; o WhatsApp/IG/Mensajes directo. |
| iOS Chrome / Firefox     | `navigator.share({files})` (Chrome iOS soporta) | Igual al anterior (todos usan WebKit). |
| Android Chrome           | `navigator.share({files})`                      | Sheet nativo Android → IG / WhatsApp / Drive / Descargas. |
| Android Firefox          | Depende de versión; si falla → fallback blob.   | Descarga directa al folder Downloads. |
| Desktop Chrome/Edge      | `canShare({files})` retorna `false` → fallback. | Descarga directa, archivo `placa-{slug}.png`. |
| Desktop Safari (macOS)   | `canShare({files})` retorna `true` desde Safari 17 → Share Sheet macOS; antes → blob. | Variable. |
| Desktop Firefox          | `navigator.share` no existe → fallback.         | Descarga directa. |

Detalles operativos:

- **Catch del `share()`**: si el usuario cancela el sheet, el catch deja seguir hacia el fallback `<a download>` — esto significa que **cancelar el sheet siempre termina descargando el archivo igual** (en algunos casos puede ser inesperado). Es un comportamiento intencional según el código (comentario `user cancelled or permission denied; fall through`).
- **CORS**: las fotos se cargan con `crossOrigin='anonymous'`. Si Tokko no devuelve `Access-Control-Allow-Origin` permisivo, la imagen falla en `tryLoadImage` y la placa termina sin foto (Editorial sin foto). Hoy Tokko sí responde con CORS abierto, pero es un riesgo silencioso.
- **Spinner**: el botón muestra spinner blanco mientras `generating === true` y queda con `opacity 0.6, cursor: not-allowed`.

---

## 6. Tracking

**No hay ningún evento de tracking asociado a la feature de placas.**

- No hay `gtag`/`fbq` en `MobileStickyBar` (botón Placa), ni en `ShareButtons` (botón Placa), ni en `PlacaSelectorClient`, ni en `StoryPlateMulti.handleDownload`.
- `src/lib/analytics.ts:29-68` define `events.clickWhatsapp`, `events.viewProperty`, `events.shareProperty`, `events.submitTasacion`, etc., pero **ningún `events.downloadPlaca` ni `events.openPlaca`**.

`src/lib/analytics.ts:29-68`:

```ts
export const events = {
  clickWhatsapp: (propertyId?, title?) => trackEvent('click_whatsapp', { property_id, property_title }),
  clickCall: (propertyId?) => trackEvent('click_call', { property_id }),
  viewProperty: (id, title, price) => { trackEvent('view_property', ...); trackFbEvent('ViewContent', ...) },
  shareProperty: (id, method) => trackEvent('share_property', { property_id, method }),
  submitTasacion: () => { trackEvent('submit_tasacion'); trackFbEvent('Lead', { content_name: 'Tasación' }) },
  useFilter: (name, value) => trackEvent('use_filter', ...),
  clickEmprendimiento: (name) => trackEvent('click_emprendimiento', ...),
  // (no events.downloadPlaca)
}
```

---

## 7. `/api/story/[slug]` — endpoint OG huérfano

Existe `src/app/api/story/[slug]/route.tsx` (223 líneas) que genera **la misma placa server-side** con `next/og` `ImageResponse` (`runtime: 'nodejs'`). Sirve un PNG 1080×1920 con foto principal + pills + título + precio + features + footer + badge "SI" verde.

**Pero no se usa en ningún `og:image`** del sitio:

- `src/app/propiedades/[slug]/page.tsx:56-67` (`generateMetadata`) setea `openGraph.images` con la foto cruda (`getMainPhoto(property)`), no con `https://siinmobiliaria.com/api/story/{slug}`.
- `grep -r "/api/story"` solo lo encuentra mencionado en `docs/REPORTE-FINAL.md:60` como caso legítimo de `<img>` en satori. **Ningún consumidor activo**.

Implicación: o bien (a) hay que cablear `og:image: https://siinmobiliaria.com/api/story/{slug}` para que WhatsApp/Twitter/Facebook muestren la placa en lugar de la foto pelada al compartir el link de la propiedad, o bien (b) borrar la ruta porque está acumulando deuda. Probablemente fue la versión inicial antes de migrar a canvas client-side.

---

## 8. Oportunidades de mejora detectadas

> En orden aproximado de impacto/esfuerzo. **No** estoy proponiendo aplicar nada, solo dejar el listado para evaluar.

### UX y producto

1. **Tracking ausente.** Agregar al menos dos eventos GA4: `open_placa_selector` (click en el botón Placa) y `download_placa` (con `variant: 'editorial' | 'split'`, `photos_count: 0|1|2`, `property_id`). Sin esto no se puede medir si la feature mueve la aguja.
2. **No hay variantes 1:1 ni 4:5.** Hoy solo se exporta 9:16. Para feed de IG (1080×1080) o post tipo 4:5 (1080×1350) habría que clonar layouts. La estructura del dispatcher (`drawSplitCard`/`drawEditorialCover`) permitiría agregarlas sin reescribir.
3. **Cancelar el sheet de share dispara la descarga igual.** El `catch { /* fall through */ }` no distingue cancelación de error real. Resultado: el usuario que cierra el sheet recibe igual un PNG en Descargas. Vale la pena diferenciar (`AbortError` vs error real) y solo caer al fallback si fue error.
4. **El selector permite 0 fotos**: el botón se habilita con la primera foto, pero si el usuario no toca nada y la propiedad no tiene fotos se descarga una placa con fondo verde liso. Tal vez ofrecer "Usar foto principal" precargado al entrar en la página.
5. **El barrio se infiere por regex sobre `fake_address`.** Si el campo Tokko no contiene el nombre del barrio textualmente, queda solo la ciudad. Falla silenciosamente. Una opción es pasar la división primaria de Tokko aunque no aparezca en la dirección.
6. **No hay opción de previsualizar la placa final antes de descargar.** `PlacaPreview` es una representación CSS aproximada, pero el render canvas final puede diferir (line-height, kerning, sombras). Con un canvas de baja resolución a la vista (e.g. 270×480 con `scale(0.25)`) se podría mostrar el output real.
7. **Logo único `logo-si-white.png`.** No hay variante para fondos claros (banda blanca del Split usa el mismo logo blanco — funciona porque arriba del logo siempre hay foto, no banda; verificar si en algún flujo el logo cae sobre blanco).
8. **Sin opción de copiar al portapapeles.** Para escritorio sería UX más fluido que descargar el PNG.

### Performance / robustez

9. **Carga de fotos sin caché ni preload.** `tryLoadImage` espera la red en cada generación. Como el server ya pasa los URLs, podría hacerse `<link rel="preload" as="image">` desde `PlacaSelectorClient` apenas el usuario selecciona, para ganar 200–500 ms al click.
10. **`crossOrigin='anonymous'` sin verificación.** Si Tokko cambia su política CORS la placa se rompe sin aviso y aparece la versión sin foto. Conviene loguear el fallo (al menos `console.warn`) y mostrar un toast "no pudimos cargar las fotos, intentá de nuevo".
11. **Sin error boundary.** Si `generate()` lanza, el botón vuelve a su estado normal pero el usuario no se entera. Falta toast/inline error.
12. **`document.fonts.load` solo se llama dentro de `generate`.** En la primera descarga la fuente puede no estar lista todavía; el `await` ayuda pero hay variantes que no se incluyeron en el array (ej. 600/40 Raleway si se llegara a usar). Mantener una lista canónica derivada de los pesos reales que dibuja cada draw* para evitar drift.

### Diseño / branding

13. **Tokens de marca incompletos.** La memoria define Gold `#B8935A` y Paper `#FAF7F2`, además de Fraunces/Inter/Montserrat/Orbitron. La placa solo usa verde + Raleway/Poppins. Definir si la placa debe respetar el set completo (gold accent en divisores? Fraunces para título?) o si la decisión deliberada fue minimalismo en blanco/verde.
14. **Letter-spacing negativo agresivo.** Título a -4 px y precio a -4.5 px puede romperse en strings cortas tipo "U$S 90.000" donde la "U" y el "$" se besan. Verificar con precios reales.
15. **El badge "SI" del `/api/story` usa `font-family: 'sans-serif'`** literal — no es ni Orbitron ni Montserrat ni Raleway. Si esa ruta vuelve a usarse, hay que cargar la fuente vía `fetch` + `fonts: [{...}]` en el `ImageResponse` (Satori no toma `next/font` automáticamente).
16. **El precio puede sobrepasar el ancho de canvas.** A 140 px sin wrap, un precio largo como "AR$ 1.250.000.000 / mes" se sale por la derecha. No hay shrink-to-fit.
17. **No hay reduction de calidad para WhatsApp.** WhatsApp re-comprime imágenes >100 KB. Un `quality` opcional en `canvas.toBlob('image/jpeg', 0.85)` reduciría tamaño sin pérdida visible y mejoraría el upload mobile.

### Limpieza

18. **`/api/story/[slug]/route.tsx` está muerto.** O se cablea como `og:image` en `propiedades/[slug]/page.tsx` (mejora cómo se ven los links de propiedad compartidos en redes), o se borra. Mientras tanto consume tiempo de build y ESLint passes.
19. **`StoryPlate.tsx` (no inspeccionado en detalle)** está en el repo además de `StoryPlateMulti.tsx`. Vale la pena confirmar si es legacy y eliminarlo para que no haya dos motores de placa con drift de diseño.
20. **`PlacaPreview` y `StoryPlateMulti` duplican lógica** (`buildSpecs`, `buildPills`, layout decisions). Extraer a `lib/placa/spec.ts` para que el preview y la placa real no se desincronicen visualmente.
