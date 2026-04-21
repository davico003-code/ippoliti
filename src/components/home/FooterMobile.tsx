import Image from 'next/image'
import Link from 'next/link'
import EmailLink from '../EmailLink'

const GREEN = '#1A5C38'
const EMAIL_B64 = 'aW5mb0BzaWlubW9iaWxpYXJpYS5jb20='

const SEDES_FOOTER = [
  { nombre: 'Oficina Histórica', year: '1983', extra: null, direccion: '1ro de Mayo 258, Roldán', horario: 'Lun a Vie · 9 a 17hs' },
  { nombre: 'Oficina Ventas', year: '2015', extra: null, direccion: 'Catamarca 775, Roldán', horario: 'Lun a Vie · 9 a 17hs' },
  { nombre: 'Oficina Funes', year: '2024', extra: 'Inmobiliaria + Galería de Arte', direccion: 'Hipólito Yrigoyen 2643, Funes', horario: 'Lun a Vie · 9 a 17hs' },
]

const REDES: { nombre: string; handle: string; href?: string; icon: string; disabled?: boolean }[] = [
  { nombre: 'Instagram', handle: '@inmobiliaria.si', href: 'https://www.instagram.com/inmobiliaria.si/', icon: 'ig' },
  { nombre: 'David Flores', handle: '@davidflores.pov', href: 'https://www.instagram.com/davidflores.pov', icon: 'ig' },
  { nombre: 'Podcast', handle: 'Charlas Que Sí', href: 'https://www.youtube.com/@mundosiinmobiliaria', icon: 'yt' },
  { nombre: 'Facebook', handle: 'SI INMOBILIARIA', href: 'https://www.facebook.com/inmobiliariaippoliti/', icon: 'fb' },
  { nombre: 'TikTok', handle: '@si.inmobiliaria', href: 'https://www.tiktok.com/@si.inmobiliaria', icon: 'tt' },
  { nombre: 'LinkedIn', handle: 'Próximamente', icon: 'li', disabled: true },
  { nombre: 'X', handle: 'Próximamente', icon: 'x', disabled: true },
]

function SocialIcon({ type }: { type: string }) {
  if (type === 'ig') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: GREEN }}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
  if (type === 'yt') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: GREEN }}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
  if (type === 'tt') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: GREEN }}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.91a8.16 8.16 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1.84-.31z" />
    </svg>
  )
  if (type === 'li') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: GREEN }}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
  if (type === 'x') return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" style={{ color: GREEN }}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: GREEN }}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

export default function FooterMobile() {
  return (
    <footer className="bg-gray-950 text-white">
      {/* 1. Logo + tagline + email */}
      <div className="px-5 pt-10 pb-8 border-b border-white/10">
        <Image
          src="/logo-blanco.png"
          alt="SI INMOBILIARIA"
          width={164}
          height={24}
          className="object-contain opacity-90"
          style={{ height: 28, width: 'auto' }}
        />
        <p className="font-lora italic text-white/70 text-[15px] leading-relaxed mt-4 max-w-[280px]">
          Acompañamos familias en Funes y Roldán desde 1983.
        </p>
        <EmailLink
          encoded={EMAIL_B64}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
          }
          label="Escribinos a SI INMOBILIARIA"
          placeholder="Escribinos"
          className="mt-4 flex items-center gap-2 text-white/70 hover:text-white transition"
          textClassName="font-poppins text-[13px]"
        />
      </div>

      {/* 2. Redes */}
      <div className="px-5 py-7 border-b border-white/10">
        <p className="font-poppins text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Seguinos</p>
        <div className="grid grid-cols-2 gap-3">
          {REDES.map(r =>
            r.disabled ? (
              <div
                key={`${r.icon}-${r.nombre}`}
                aria-label={`${r.nombre} ${r.handle}`}
                aria-disabled="true"
                className="bg-white/5 border border-white/10 rounded-xl p-3.5 opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-2.5">
                  <SocialIcon type={r.icon} />
                  <div>
                    <p className="font-poppins font-bold text-white text-[12px]">{r.nombre}</p>
                    <p className="font-poppins text-white/50 text-[10px]">{r.handle}</p>
                  </div>
                </div>
              </div>
            ) : (
              <a
                key={`${r.icon}-${r.nombre}`}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${r.nombre} ${r.handle}`}
                className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-2.5">
                  <SocialIcon type={r.icon} />
                  <div>
                    <p className="font-poppins font-bold text-white text-[12px]">{r.nombre}</p>
                    <p className="font-poppins text-white/50 text-[10px]">{r.handle}</p>
                  </div>
                </div>
              </a>
            ),
          )}
        </div>
      </div>

      {/* 3. Sitemap */}
      <div className="px-5 py-7 border-b border-white/10">
        <div className="grid grid-cols-2 gap-x-5 gap-y-7">
          <div>
            <p className="font-poppins text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Propiedades</p>
            <ul className="space-y-2.5">
              <li><Link href="/propiedades" className="font-poppins text-white text-[13px]">Todas en venta</Link></li>
              <li><Link href="/propiedades?type=casa" className="font-poppins text-white/80 text-[13px]">Casas</Link></li>
              <li><Link href="/propiedades?type=departamento" className="font-poppins text-white/80 text-[13px]">Departamentos</Link></li>
              <li><Link href="/propiedades?type=terreno" className="font-poppins text-white/80 text-[13px]">Lotes</Link></li>
              <li><Link href="/emprendimientos" className="font-poppins text-white/80 text-[13px]">Emprendimientos</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-poppins text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Por zona</p>
            <ul className="space-y-2.5">
              <li><Link href="/propiedades?q=funes" className="font-poppins text-white/80 text-[13px]">Casas en Funes</Link></li>
              <li><Link href="/propiedades?q=roldan" className="font-poppins text-white/80 text-[13px]">Lotes en Roldán</Link></li>
              <li><Link href="/propiedades?q=fisherton" className="font-poppins text-white/80 text-[13px]">Casas en Fisherton</Link></li>
              <li><Link href="/propiedades?q=kentucky" className="font-poppins text-white/80 text-[13px]">Kentucky Club</Link></li>
              <li><Link href="/propiedades?q=funes+lake" className="font-poppins text-white/80 text-[13px]">Funes Lake</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-poppins text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Servicios</p>
            <ul className="space-y-2.5">
              <li><Link href="/tasaciones" className="font-poppins text-white text-[13px]">Tasaciones</Link></li>
              <li><Link href="/guia" className="font-poppins text-white/80 text-[13px]">Guía del comprador</Link></li>
              <li><Link href="/blog" className="font-poppins text-white/80 text-[13px]">Blog</Link></li>
              <li><Link href="/informes" className="font-poppins text-white/80 text-[13px]">Informes de mercado</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-poppins text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Empresa</p>
            <ul className="space-y-2.5">
              <li><Link href="/nosotros" className="font-poppins text-white/80 text-[13px]">Nosotros</Link></li>
              <li><Link href="/blog" className="font-poppins text-white/80 text-[13px]">Blog</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Oficinas NAP */}
      <div className="px-5 py-7 border-b border-white/10">
        <p className="font-poppins text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Nuestras oficinas</p>
        <div className="space-y-4">
          {SEDES_FOOTER.map(s => (
            <div key={s.nombre}>
              <div className="flex items-baseline gap-2">
                <p className="font-raleway font-bold text-white text-[14px]">{s.nombre}</p>
                <p className="font-poppins text-[10px] font-bold tracking-wider" style={{ color: GREEN, fontVariantNumeric: 'tabular-nums' }}>{s.year}</p>
              </div>
              {s.extra && <p className="font-poppins text-white/70 text-[11px] italic mt-0.5">{s.extra}</p>}
              <p className="font-poppins text-white/60 text-[12px] mt-0.5">{s.direccion}</p>
              <p className="font-poppins text-white/40 text-[11px] mt-0.5">{s.horario}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Brand + Legal */}
      <div className="px-5 py-7">
        <Image
          src="/logo-blanco.png"
          alt="SI INMOBILIARIA"
          width={164}
          height={24}
          className="object-contain opacity-90"
          style={{ height: 28, width: 'auto' }}
        />
        <p className="font-poppins text-white/50 text-[12px] mt-3 leading-relaxed">
          Inmobiliaria familiar fundada en Roldán en 1983.<br />
          Funes · Roldán · Rosario.
        </p>
        <div className="space-y-1.5 mt-5 mb-5">
          <p className="font-poppins text-white/40 text-[11px]">David Flores · Corredor Inmobiliario</p>
          <p className="font-poppins text-white/40 text-[11px]" style={{ fontVariantNumeric: 'tabular-nums' }}>Mat. N° 0621 · CCPISCRR</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5">
          <Link href="/privacidad" className="font-poppins text-white/50 text-[11px]">Privacidad</Link>
          <Link href="/terminos" className="font-poppins text-white/50 text-[11px]">Términos</Link>
        </div>
        <p className="font-poppins text-white/30 text-[11px] pt-4 border-t border-white/10" style={{ fontVariantNumeric: 'tabular-nums' }}>
          © 1983–2026 SI INMOBILIARIA · Todos los derechos reservados
        </p>
      </div>
    </footer>
  )
}
