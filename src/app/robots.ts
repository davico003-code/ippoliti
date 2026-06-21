import type { MetadataRoute } from 'next'

// Zonas privadas que ningún bot debe indexar.
const DISALLOW = ['/api/', '/admin/', '/agentes/', '/recursos/si-school/']

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
