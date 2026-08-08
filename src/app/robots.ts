import type { MetadataRoute } from 'next'

// Zonas privadas que ningún bot debe rastrear. OJO: solo van acá las rutas SIN
// meta noindex propio (/api/ no tiene HTML; /admin/ son shells client-gated).
// Las demás zonas privadas (/agentes/, /school, /recursos/si-school/,
// /propiedades-hilo/, /fichas, /seleccion/) se protegen con robots noindex en
// su metadata: si además estuvieran en Disallow, Google tendría prohibido
// rastrearlas y NUNCA leería el noindex → podrían quedar indexadas "sin
// descripción disponible" si alguien las linkea.
const DISALLOW = ['/api/', '/admin/']

// Bots de asistentes de IA (ChatGPT, Claude, Gemini, Perplexity, etc.).
// Los habilitamos EXPLÍCITAMENTE para que nos puedan leer y citar en sus
// respuestas (GEO/AEO). Es la decisión intencional, no el default.
const AI_BOTS = [
  'GPTBot', // OpenAI — entrenamiento
  'OAI-SearchBot', // OpenAI — búsqueda de ChatGPT
  'ChatGPT-User', // ChatGPT — navegación en vivo del usuario
  'ClaudeBot', // Anthropic — Claude
  'Claude-Web',
  'anthropic-ai',
  'Google-Extended', // Gemini / Vertex (sin esto, Gemini no nos usa aunque Google sí indexe)
  'PerplexityBot',
  'Perplexity-User',
  'Applebot-Extended', // Apple Intelligence
  'cohere-ai',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/', disallow: DISALLOW })),
    ],
    sitemap: 'https://siinmobiliaria.com/sitemap.xml',
    host: 'https://siinmobiliaria.com',
  }
}
