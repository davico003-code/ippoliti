import { XMLParser } from 'fast-xml-parser';
import * as cheerio from 'cheerio';
import type { Fuente } from '../config/sources';

export interface Titular {
  titulo: string;
  url: string;
  fecha?: Date;
  resumen?: string;
  fuente: string;
}

const UA = 'SIInmobiliariaBot/1.0 (+https://siinmobiliaria.com)';
const TIMEOUT_MS = 15_000;
const MAX_PER_FUENTE = 15;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function esReciente(fecha: Date | undefined): boolean {
  if (!fecha) return true; // si no hay fecha, asumir reciente
  return Date.now() - fecha.getTime() < SEVEN_DAYS_MS;
}

function limpiarTitulo(raw: string): string {
  return raw
    .replace(/^(VIDEO|FOTOS|AUDIO|EN VIVO|GALERÍA)\s*:\s*/i, '')
    .replace(/[\u2600-\u27BF\uFE00-\uFE0F]/g, '') // remove common emojis
    .trim();
}

async function fetchConTimeout(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': UA },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

// ─── RSS parsing ───────────────────────────────────────────────────────────────

async function scrapearRSS(fuente: Fuente): Promise<Titular[]> {
  if (!fuente.rssUrl) return [];
  const xml = await fetchConTimeout(fuente.rssUrl);
  const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: true });
  const parsed = parser.parse(xml);

  // Handle both RSS 2.0 and Atom formats
  const items: unknown[] =
    parsed?.rss?.channel?.item ??
    parsed?.feed?.entry ??
    [];

  const arr = Array.isArray(items) ? items : [items];

  const titulares: Titular[] = [];
  for (const item of arr) {
    const i = item as Record<string, unknown>;
    const titulo = limpiarTitulo(String(i.title ?? ''));
    const url = String(i.link ?? (i as Record<string, Record<string, string>>).link?.['@_href'] ?? '');
    const fechaRaw = i.pubDate ?? i.published ?? i.updated;
    const fecha = fechaRaw ? new Date(String(fechaRaw)) : undefined;
    const resumen = i.description
      ? String(i.description).replace(/<[^>]*>/g, '').slice(0, 200)
      : undefined;

    if (!titulo || !url) continue;
    if (!esReciente(fecha)) continue;

    titulares.push({ titulo, url, fecha, resumen, fuente: fuente.name });
    if (titulares.length >= MAX_PER_FUENTE) break;
  }

  return titulares;
}

// ─── Sitemap parsing ───────────────────────────────────────────────────────────

async function scrapearSitemap(fuente: Fuente): Promise<Titular[]> {
  if (!fuente.sitemapUrl) return [];
  const xml = await fetchConTimeout(fuente.sitemapUrl);
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);

  const urls: unknown[] = parsed?.urlset?.url ?? [];
  const arr = Array.isArray(urls) ? urls : [urls];

  const titulares: Titular[] = [];
  for (const entry of arr) {
    const e = entry as Record<string, unknown>;
    const url = String(e.loc ?? '');
    const lastmod = e.lastmod ? new Date(String(e.lastmod)) : undefined;

    if (!url || !esReciente(lastmod)) continue;

    // Extract title from URL slug
    const slug = url.split('/').filter(Boolean).pop() ?? '';
    const titulo = limpiarTitulo(
      slug.replace(/-/g, ' ').replace(/\.html?$/, ''),
    );

    if (!titulo || titulo.length < 10) continue;

    titulares.push({ titulo, url, fecha: lastmod, fuente: fuente.name });
    if (titulares.length >= MAX_PER_FUENTE) break;
  }

  return titulares;
}

// ─── HTML scraping ─────────────────────────────────────────────────────────────

const SELECTORS = [
  'article h2 a',
  'article h3 a',
  '.entry-title a',
  '.post-title a',
  'h2.title a',
  'h2 a[href]',
  'h3 a[href]',
  '.article-title a',
  '.news-title a',
  '.nota-titulo a',
];

async function scrapearHTML(fuente: Fuente): Promise<Titular[]> {
  const html = await fetchConTimeout(fuente.url);
  const $ = cheerio.load(html);
  const titulares: Titular[] = [];
  const seen = new Set<string>();

  // Use custom selector first if provided
  const selectors = fuente.selector
    ? [fuente.selector, ...SELECTORS]
    : SELECTORS;

  for (const sel of selectors) {
    $(sel).each((_, el) => {
      if (titulares.length >= MAX_PER_FUENTE) return false;

      const $el = $(el);
      const titulo = limpiarTitulo($el.text());
      let url = $el.attr('href') ?? '';

      if (!titulo || titulo.length < 10 || !url) return;

      // Resolve relative URLs
      if (url.startsWith('/')) {
        url = new URL(url, fuente.url).href;
      }

      if (seen.has(url)) return;
      seen.add(url);

      titulares.push({ titulo, url, fuente: fuente.name });
    });

    if (titulares.length >= MAX_PER_FUENTE) break;
  }

  return titulares;
}

// ─── Main export ───────────────────────────────────────────────────────────────

export async function scrapearTitulares(fuente: Fuente): Promise<Titular[]> {
  // Skip pure data sources (BCRA, CAC) — handled separately
  if (fuente.scope === 'datos') return [];

  try {
    // 1. Try RSS first (most reliable)
    if (fuente.rssUrl) {
      const rss = await scrapearRSS(fuente);
      if (rss.length > 0) {
        console.log(`[scraper] ${fuente.name}: ${rss.length} titulares vía RSS`);
        return rss;
      }
    }

    // 2. Try sitemap
    if (fuente.sitemapUrl) {
      const sitemap = await scrapearSitemap(fuente);
      if (sitemap.length > 0) {
        console.log(`[scraper] ${fuente.name}: ${sitemap.length} titulares vía sitemap`);
        return sitemap;
      }
    }

    // 3. Fallback to HTML scraping
    const html = await scrapearHTML(fuente);
    console.log(`[scraper] ${fuente.name}: ${html.length} titulares vía HTML`);
    return html;
  } catch (err) {
    console.warn(
      `[scraper] ${fuente.name} falló: ${err instanceof Error ? err.message : String(err)}`,
    );
    return [];
  }
}
