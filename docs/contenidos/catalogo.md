# Mundo SI — videoteca

Diseño: segunda propuesta organizada por series, revisada a pedido de David con fondo blanco, acentos verde SI y Raleway. Logos oficiales SI, Charlas que Sí y redes.
Ruta: `/contenidos`. Incluye búsqueda, categorías, paginación, páginas de cada video,
reproducción a pedido, enlaces originales, blog existente y seis perfiles sociales.

## Inventario relevado el 8 de octubre de 2026

- YouTube `@mundosiinmobiliaria`: 24 videos largos (8 charlas, 6 Mundo SI,
  10 recorridos) y 100 Shorts (incluidas las dos páginas de continuación del canal). Los 124 respondieron correctamente a oEmbed.
  Se excluyeron los tres videos de la oficina de Hipólito Yrigoyen: quedan 121.
  Fecha, duración y descripción verificadas en YouTube para los primeros 72.
- Instagram: 16 reels visibles en los perfiles públicos de `@inmobiliaria.si`
  y `@davidflores.pov`, incluidos reels compartidos de `@charlasque.si`.
  Portadas reales conservadas en `public/contenidos` (evita URLs firmadas caducadas).
  Títulos editoriales basados en la portada o en el caption visible; no son transcripciones.
- Blog: `getAllPosts()`, conserva reglas de publicación y portadas existentes.
- TikTok: cuatro publicaciones reales de `@si.inmobiliaria`, verificadas en el perfil público. Portadas locales y reproductor oficial a pedido. Títulos editoriales basados en captions.
- IA: dos placas con voz ya publicadas en Cómo trabajamos (Los Robles y Vida 058). Se reutilizan los MP4 y portadas existentes, sin crear material nuevo.
- Facebook: acceso al perfil ya configurado en la web, sin importar publicaciones.

## Mantenimiento

El catálogo de videos es una selección versionada, no una sincronización automática.
Catálogos: `src/data/contenidos/{youtube,instagram,tiktok,ia}.json`.
TikTok: `tt-<id>`; reproductor según https://developers.tiktok.com/docs/en/embed-player.
Iconos de redes: SVG del repositorio oficial Simple Icons. Logo Charlas que Sí: vector existente entregado en Downloads.
Agregar id único, título, categoría, plataforma, URL original, portada, duración si
se conoce y formato vertical. Instagram usa `ig-<shortcode>` como ID.
Verificar que el enlace corresponde a las cuentas de SI y que es público antes de agregarlo.
No atribuir un Short de YouTube a Instagram/TikTok sin el enlace real de esa publicación.
No publicar URLs firmadas de Instagram como portadas permanentes.
Los videos se consultan desde `src/lib/contenidos.ts` y entran automáticamente al sitemap.
El blog se regenera cada hora a partir de la fuente actual.

## Límites de disponibilidad

YouTube oEmbed confirma disponibilidad pública, no garantiza reproducción en todos los
navegadores/regiones. Instagram puede pedir login o limitar un embed; siempre se ofrece
el enlace original junto al reproductor. Los videos de redes no se descargan ni se alojan nuevamente. Las dos piezas IA reutilizan archivos propios existentes.
No se agregan métricas ni fechas de publicación inventadas.

## Publicación

La rama `feat/videoteca-si` se entrega mediante preview. La regla de AGENTS.md del
repositorio exige aprobación visual del preview antes del merge a main.
