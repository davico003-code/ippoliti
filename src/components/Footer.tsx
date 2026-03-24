import Link from 'next/link'
import { Facebook, Instagram, Youtube } from 'lucide-react'

const LINKS = [
  { label: 'Comprar', href: '/propiedades?op=venta' },
  { label: 'Alquilar', href: '/propiedades?op=alquiler' },
  { label: 'Vender', href: '/tasaciones' },
  { label: 'Tasaciones', href: '/tasaciones' },
  { label: 'Emprendimientos', href: '/emprendimientos' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Blog', href: '/blog' },
]

const SOCIALS = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ backgroundColor: '#0F3D25' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Top row: logo | links | socials */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-blanco.png" alt="SI Inmobiliaria" style={{ height: '36px', width: 'auto' }} />
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            {LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className="text-white/70 hover:text-white text-xs font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Socials */}
          <div className="flex items-center gap-2">
            {SOCIALS.map(s => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-all"
              >
                <s.icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Contact line */}
        <div className="text-center text-white/50 text-[11px] mb-5">
          <span className="font-numeric">(341) 210-1694</span>
          <span className="mx-2">·</span>
          <a href="mailto:ventas@inmobiliariaippoliti.com" className="hover:text-white/70 transition-colors">ventas@inmobiliariaippoliti.com</a>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-white/40 text-[11px]">
          <p>&copy; {year} SI Inmobiliaria. Todos los derechos reservados.</p>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-white/60 transition-colors">Política de Privacidad</a>
            <span>·</span>
            <a href="#" className="hover:text-white/60 transition-colors">Términos y Condiciones</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
