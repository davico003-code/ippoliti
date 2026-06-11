// JSON-LD BreadcrumbList reutilizable para landings de categoría.
// Server Component puro: solo emite el <script>, sin UI.

interface Crumb {
  name: string
  url: string
}

export default function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
