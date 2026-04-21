import Link from 'next/link'
import { Mail } from 'lucide-react'
import EmailLink from '../EmailLink'

const GREEN = '#1A5C38'
const EMAIL_B64 = 'aW5mb0BzaWlubW9iaWxpYXJpYS5jb20='

const SEDES_FOOTER = [
  { nombre: 'Oficina Histórica', year: '1983', extra: null, direccion: '1ro de Mayo 258, Roldán' },
  { nombre: 'Oficina Ventas', year: '2015', extra: null, direccion: 'Catamarca 775, Roldán' },
  { nombre: 'Oficina Funes', year: '2024', extra: 'Inmobiliaria + Galería de Arte', direccion: 'Hipólito Yrigoyen 2643, Funes' },
]

const NAV_LINKS = [
  { href: '/propiedades', label: 'Propiedades' },
  { href: '/emprendimientos', label: 'Emprendimientos' },
  { href: '/tasaciones', label: 'Tasaciones' },
  { href: '/guia', label: 'Guía' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/blog', label: 'Blog' },
]

const SOCIAL: { href?: string; label: string; icon: string; disabled?: boolean }[] = [
  { href: 'https://www.instagram.com/inmobiliaria.si/', label: 'Instagram SI INMOBILIARIA', icon: 'ig' },
  { href: 'https://www.instagram.com/davidflores.pov', label: 'Instagram @davidflores.pov', icon: 'ig' },
  { href: 'https://www.youtube.com/@mundosiinmobiliaria', label: 'YouTube · Charlas Que Sí', icon: 'yt' },
  { href: 'https://www.facebook.com/inmobiliariaippoliti/', label: 'Facebook', icon: 'fb' },
  { href: 'https://www.tiktok.com/@si.inmobiliaria', label: 'TikTok', icon: 'tt' },
  { label: 'LinkedIn (próximamente)', icon: 'li', disabled: true },
  { label: 'X (próximamente)', icon: 'x', disabled: true },
]

function SocialIcon({ type }: { type: string }) {
  if (type === 'ig') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
  )
  if (type === 'fb') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
  )
  if (type === 'yt') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
  )
  if (type === 'li') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
  )
  if (type === 'x') return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
  )
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.91a8.16 8.16 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1.84-.31z" /></svg>
  )
}

export default function FooterDesktop() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-8 pt-16 pb-10">
        {/* 4 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-white/10">

          {/* Col 1: marca + email */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white font-raleway font-black text-xs w-8 h-8 rounded flex items-center justify-center" style={{ color: GREEN }}>SI</div>
              <span className="font-raleway font-bold text-sm tracking-[0.15em] text-white">INMOBILIARIA</span>
            </div>
            <p className="font-lora italic text-white/70 text-[14px] leading-relaxed max-w-[260px]">
              Acompañamos familias en Funes y Roldán desde 1983.
            </p>
            <EmailLink
              encoded={EMAIL_B64}
              icon={<Mail className="w-3.5 h-3.5" />}
              label="Escribinos a SI INMOBILIARIA"
              placeholder="Escribinos"
              className="mt-6 flex items-center gap-2 text-white/70 hover:text-white transition"
              textClassName="font-poppins text-[13px]"
            />
          </div>

          {/* Col 2: sedes */}
          <div>
            <p className="font-poppins text-[11px] font-bold tracking-[0.2em] uppercase mb-5" style={{ color: GREEN }}>Sedes</p>
            <div className="space-y-5">
              {SEDES_FOOTER.map(s => (
                <div key={s.nombre}>
                  <div className="flex items-baseline gap-2">
                    <p className="font-raleway font-bold text-[14px]">{s.nombre}</p>
                    <p className="font-poppins text-[10px] font-bold tracking-wider" style={{ color: GREEN, fontVariantNumeric: 'tabular-nums' }}>{s.year}</p>
                  </div>
                  {s.extra && <p className="font-poppins text-white/70 text-[11px] italic mt-0.5">{s.extra}</p>}
                  <p className="font-poppins text-white/60 text-[12px] mt-1">{s.direccion}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: navegación */}
          <div>
            <p className="font-poppins text-[11px] font-bold tracking-[0.2em] uppercase mb-5" style={{ color: GREEN }}>Navegación</p>
            <div className="flex flex-col gap-3">
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href} className="font-poppins text-white/80 hover:text-white transition text-[14px]">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Col 4: redes */}
          <div>
            <p className="font-poppins text-[11px] font-bold tracking-[0.2em] uppercase mb-5" style={{ color: GREEN }}>Seguinos</p>
            <div className="flex items-center gap-3 flex-wrap">
              {SOCIAL.map(s =>
                s.disabled ? (
                  <span
                    key={`${s.icon}-${s.label}`}
                    aria-label={s.label}
                    aria-disabled="true"
                    title={s.label}
                    className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/30 cursor-not-allowed"
                  >
                    <SocialIcon type={s.icon} />
                  </span>
                ) : (
                  <a
                    key={`${s.icon}-${s.label}`}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white/80 transition-colors hover:border-[#1A5C38] hover:text-[#1A5C38]"
                  >
                    <SocialIcon type={s.icon} />
                  </a>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="pt-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-poppins text-white/40 text-[12px]">Mat. N° 0621 — David Flores</p>
            <p className="font-poppins text-white/40 text-[12px]">SI INMOBILIARIA © 2026 · Todos los derechos reservados</p>
          </div>
          <p className="font-poppins text-white/30 text-[11px] italic">Una empresa familiar desde 1983</p>
        </div>
      </div>
    </footer>
  )
}
