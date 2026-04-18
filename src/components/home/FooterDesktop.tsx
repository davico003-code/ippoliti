import Link from 'next/link'
import { Mail } from 'lucide-react'

const GREEN = '#1A5C38'

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

const SOCIAL = [
  { href: 'https://www.instagram.com/inmobiliaria.si/', label: 'Instagram', icon: 'ig' },
  { href: 'https://www.facebook.com/inmobiliariaippoliti/', label: 'Facebook', icon: 'fb' },
  { href: 'https://www.youtube.com/@mundosiinmobiliaria', label: 'YouTube', icon: 'yt' },
  { href: 'https://www.tiktok.com/@si.inmobiliaria', label: 'TikTok', icon: 'tt' },
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
            <a href="mailto:info@siinmobiliaria.com" className="mt-6 flex items-center gap-2 text-white/70 hover:text-white transition">
              <Mail className="w-3.5 h-3.5" />
              <span className="font-poppins text-[13px]">info@siinmobiliaria.com</span>
            </a>
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
            <div className="flex items-center gap-3">
              {SOCIAL.map(s => (
                <a key={s.icon} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-gray-900 transition">
                  <SocialIcon type={s.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="pt-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-poppins text-white/40 text-[12px]">Mat. N° 0621 — David Flores</p>
            <p className="font-poppins text-white/40 text-[12px]">SI Inmobiliaria © 2026 · Todos los derechos reservados</p>
          </div>
          <p className="font-poppins text-white/30 text-[11px] italic">Una empresa familiar desde 1983</p>
        </div>
      </div>
    </footer>
  )
}
