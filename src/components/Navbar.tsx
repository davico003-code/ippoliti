// Server component. Desktop nav (lg+) se renderiza en el SSR inicial —
// todos los links son estáticos y el crawler los lee sin esperar a JS.
// Mobile nav (hamburger + drawer) está aislado como client island en
// NavbarMobile (usePathname + useState).

import Link from 'next/link'
import Image from 'next/image'
import NavbarMobile from './NavbarMobile'

const R = "'Raleway', system-ui, sans-serif"

const LEFT_ITEMS = [
  { href: '/propiedades?op=venta', label: 'Comprar' },
  { href: '/propiedades?op=alquiler', label: 'Alquilar' },
  { href: '/tasaciones', label: 'Vender' },
  { href: '/emprendimientos', label: 'Emprendimientos' },
]

const RIGHT_ITEMS = [
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/blog', label: 'Blog' },
  { href: '/guia', label: 'Guía' },
  { href: '/informes', label: 'Informes' },
]

const DRAWER_ITEMS = [...LEFT_ITEMS, ...RIGHT_ITEMS]

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="hover:text-[#1A5C38] transition-colors duration-200 whitespace-nowrap text-[14px] xl:text-[17px]"
      style={{ fontFamily: R, fontWeight: 500, color: '#111', textDecoration: 'none' }}
    >
      {label}
    </Link>
  )
}

export default function Navbar() {
  return (
    <>
      {/* Desktop nav — server-rendered */}
      <nav
        className="hidden lg:block sticky top-0 left-0 right-0 z-[100] bg-white"
        style={{ borderBottom: '1px solid #eee' }}
        aria-label="Navegación principal"
      >
        <div
          className="relative mx-auto flex items-center"
          style={{ maxWidth: 1400, padding: '18px 40px' }}
        >
          <div className="flex items-center gap-5 xl:gap-8">
            {LEFT_ITEMS.map(item => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>

          <Link
            href="/"
            className="absolute left-1/2 top-1/2"
            style={{ transform: 'translate(-50%, -50%)', textDecoration: 'none' }}
          >
            <Image
              src="/LOGO_HORIZONTAL.png"
              alt="SI INMOBILIARIA"
              width={246}
              height={36}
              className="object-contain"
              style={{ height: 36, width: 'auto' }}
              priority
              quality={90}
            />
          </Link>

          <div className="ml-auto flex items-center gap-5 xl:gap-8">
            {RIGHT_ITEMS.map(item => (
              <NavLink key={item.href} {...item} />
            ))}
            <Link
              href="/agentes"
              className="hover:opacity-90 transition-colors duration-200 text-[14px] xl:text-[17px]"
              style={{
                fontFamily: R,
                fontWeight: 500,
                color: '#fff',
                background: '#1A5C38',
                padding: '10px 24px',
                borderRadius: 6,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Ingresar
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile nav — client island con hamburger + drawer */}
      <NavbarMobile items={DRAWER_ITEMS} />
    </>
  )
}
