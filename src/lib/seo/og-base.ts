// Base de openGraph para todo el sitio.
//
// Next 14 NO mezcla en profundidad el openGraph del layout con el de cada
// página: si una página declara su propio `openGraph`, lo pisa entero y se
// pierden og:site_name, og:locale y og:type (revisión 25-oct: la home, el
// listado, el blog y las landings salían así, y Facebook/WhatsApp mostraban el
// dominio pelado en vez de "SI INMOBILIARIA"). Por eso cada openGraph propio
// arranca de esta base:
//
//   openGraph: { ...OG_BASE, title, description, url, images }
//
// o con el atajo `conOgBase({ title, ... })`. La ficha sigue pisando `type`
// con 'article' (va después del spread).

export const OG_BASE = {
  siteName: 'SI INMOBILIARIA',
  locale: 'es_AR',
  type: 'website',
} as const

// Omit: si la página trae su propio `type` ('article'), gana el de la página
// también para TypeScript (con un & quedaría 'website' & 'article' = never).
export function conOgBase<T extends object>(og: T): Omit<typeof OG_BASE, keyof T> & T {
  return { ...OG_BASE, ...og }
}
