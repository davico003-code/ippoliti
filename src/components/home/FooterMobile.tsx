import Image from 'next/image'
import Link from 'next/link'

const GREEN = '#1A5C38'

const SEDES_FOOTER = [
  { nombre: 'Oficina Histórica', year: '1983', extra: null, direccion: '1ro de Mayo 258, Roldán', horario: 'Lun a Vie · 9 a 17hs' },
  { nombre: 'Oficina Ventas', year: '2015', extra: null, direccion: 'Catamarca 775, Roldán', horario: 'Lun a Vie · 9 a 17hs' },
  { nombre: 'Oficina Funes', year: '2024', extra: 'Inmobiliaria + Galería de Arte', direccion: 'Hipólito Yrigoyen 2643, Funes', horario: 'Lun a Vie · 9 a 17hs' },
]

const REDES = [
  { nombre: 'Instagram', handle: '@inmobiliaria.si', href: 'https://www.instagram.com/inmobiliaria.si/', icon: 'ig' },
  { nombre: 'David Flores', handle: '@davidflores.pov', href: 'https://www.instagram.com/davidflores.pov', icon: 'ig' },
  { nombre: 'Podcast', handle: 'Charlas Que Sí', href: 'https://www.youtube.com/@mundosiinmobiliaria', icon: 'yt' },
  { nombre: 'Facebook', handle: 'SI Inmobiliaria', href: 'https://www.facebook.com/inmobiliariaippoliti/', icon: 'fb' },
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
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: GREEN }}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

export default function FooterMobile() {
  return (
    <footer className="bg-gray-950 text-white">
      {/* 1. CTA WhatsApp */}
      <div className="px-5 pt-10 pb-8 border-b border-white/10">
        <p className="font-poppins text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: GREEN }}>
          Contacto directo
        </p>
        <h3 className="font-raleway font-black text-[26px] leading-[1.1] mt-2">Hablemos por WhatsApp.</h3>
        <p className="font-poppins text-white/60 text-[13px] mt-2 leading-relaxed">
          Respondemos en menos de una hora, de lunes a sábado.
        </p>
        <a
          href="https://wa.me/5493412101694?text=Hola!%20Vengo%20del%20sitio%20de%20SI%20Inmobiliaria"
          target="_blank" rel="noopener noreferrer"
          className="mt-5 w-full font-poppins font-bold text-[15px] flex items-center justify-center gap-2 px-5 py-4 rounded-2xl transition text-white"
          style={{ background: GREEN }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
          <span>+54 9 341 2101694</span>
        </a>
        <a href="mailto:info@siinmobiliaria.com" className="mt-3 w-full bg-white/5 border border-white/10 text-white font-poppins font-medium text-[14px] flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl hover:bg-white/10 transition">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
          <span>info@siinmobiliaria.com</span>
        </a>
      </div>

      {/* 2. Redes */}
      <div className="px-5 py-7 border-b border-white/10">
        <p className="font-poppins text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">Seguinos</p>
        <div className="grid grid-cols-2 gap-3">
          {REDES.map(r => (
            <a key={r.handle} href={r.href} target="_blank" rel="noopener noreferrer" className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/10 transition">
              <div className="flex items-center gap-2.5">
                <SocialIcon type={r.icon} />
                <div>
                  <p className="font-poppins font-bold text-white text-[12px]">{r.nombre}</p>
                  <p className="font-poppins text-white/50 text-[10px]">{r.handle}</p>
                </div>
              </div>
            </a>
          ))}
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
              <li><Link href="/tasaciones" className="font-poppins text-white text-[13px]">Tasación gratuita</Link></li>
              <li><Link href="/guia-comprador" className="font-poppins text-white/80 text-[13px]">Guía del comprador</Link></li>
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
          src="/LOGO_HORIZONTAL.png"
          alt="SI Inmobiliaria"
          width={164}
          height={24}
          className="object-contain opacity-90"
          style={{ height: 28, width: 'auto', filter: 'brightness(0) invert(1)' }}
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
          © 1983–2026 SI Inmobiliaria · Todos los derechos reservados
        </p>
      </div>
    </footer>
  )
}
