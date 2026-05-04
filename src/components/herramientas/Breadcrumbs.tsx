import Link from 'next/link'

type Item = { label: string; href?: string }

export default function Breadcrumbs({ items }: { items: Item[] }) {
  return (
    <nav
      aria-label="Migas de pan"
      className="font-raleway text-[13px] mb-4"
      style={{ color: 'var(--tinta-mute)' }}
    >
      <ol className="flex flex-wrap items-center gap-1.5 list-none p-0 m-0">
        {items.map((it, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={`${it.label}-${i}`} className="flex items-center gap-1.5">
              {it.href && !isLast ? (
                <Link
                  href={it.href}
                  className="hover:underline"
                  style={{ color: 'var(--tinta-soft)' }}
                >
                  {it.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  style={{ color: isLast ? 'var(--tinta)' : 'var(--tinta-soft)' }}
                >
                  {it.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden style={{ color: 'var(--tinta-mute)' }}>›</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
