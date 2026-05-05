import Link from 'next/link'

type Props = {
  href: string
  eyebrow: string
  title: string
  description: string
  cta: string
  icon: React.ReactNode
}

export default function RecursoCard({
  href,
  eyebrow,
  title,
  description,
  cta,
  icon,
}: Props) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl p-7 sm:p-8 no-underline transition-all"
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--line)',
        boxShadow: '0 1px 2px rgba(20, 30, 25, 0.04)',
        color: 'inherit',
      }}
    >
      <style>{`
        .recurso-card-link { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .recurso-card-link:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(20, 30, 25, 0.10); }
      `}</style>
      <div className="recurso-card-link">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
          style={{ background: 'var(--si-green-tint)', color: 'var(--si-green)' }}
        >
          {icon}
        </div>
        <div
          className="text-[11px] font-bold uppercase tracking-[1.5px] mb-2"
          style={{ color: 'var(--si-green)' }}
        >
          {eyebrow}
        </div>
        <h3
          className="text-[22px] sm:text-[24px] font-bold tracking-[-0.015em] m-0 mb-2.5 leading-tight"
          style={{ color: 'var(--tinta)' }}
        >
          {title}
        </h3>
        <p
          className="text-[14.5px] m-0 mb-5 leading-relaxed"
          style={{ color: 'var(--tinta-soft)' }}
        >
          {description}
        </p>
        <span
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold"
          style={{ color: 'var(--si-green)' }}
        >
          {cta}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  )
}
