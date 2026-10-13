// Links internos a las páginas de localidad y de barrio: las zonas que menciona
// cada nota del blog y los barrios privados desde su localidad. (Search Console
// las marcaba "descubierta, sin rastrear": casi nada las linkeaba.) El bloque
// "Zonas" del footer está en components/Footer.tsx. Solo servidor: importa
// lib/barrios entero.

import { BARRIOS } from '@/lib/barrios'

export type LinkZona = { href: string; label: string }

/** Los barrios privados de una localidad (hoy todos los cargados son de Funes). */
export function barriosDe(zona: 'funes'): LinkZona[] {
  return BARRIOS.filter((b) => b.zona === zona).map((b) => ({ href: `/barrios-privados/${b.slug}`, label: b.nombre }))
}

const sinAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const menciona = (texto: string, nombre: string) => new RegExp(`(^|[^a-z0-9])${escapar(sinAcentos(nombre))}([^a-z0-9]|$)`).test(texto)

// Lo que se nombra en el texto → la página que lo cubre. Primero las
// localidades (son las que menos links reciben) y después los barrios.
const MENCIONES: { nombres: string[]; links: LinkZona[] }[] = [
  {
    nombres: ['Funes'],
    links: [
      { href: '/casas-en-venta-funes', label: 'Casas en venta en Funes' },
      { href: '/terrenos-funes', label: 'Terrenos en Funes' },
    ],
  },
  {
    nombres: ['Roldán'],
    links: [
      { href: '/casas-en-venta-roldan', label: 'Casas en venta en Roldán' },
      { href: '/terrenos-roldan', label: 'Terrenos en Roldán' },
    ],
  },
  { nombres: ['Fisherton'], links: [{ href: '/casas-en-venta-fisherton', label: 'Casas en Fisherton' }] },
  { nombres: ['Puerto Norte'], links: [{ href: '/departamentos-puerto-norte', label: 'Departamentos en Puerto Norte' }] },
  { nombres: ['Pichincha'], links: [{ href: '/departamentos-pichincha', label: 'Departamentos en Pichincha' }] },
  { nombres: ['Echesortu'], links: [{ href: '/departamentos-echesortu', label: 'Departamentos en Echesortu' }] },
  { nombres: ['Abasto'], links: [{ href: '/departamentos-abasto', label: 'Departamentos en Abasto' }] },
  { nombres: ['Rosario'], links: [{ href: '/rosario/departamentos', label: 'Departamentos en Rosario' }] },
  { nombres: ['alquiler temporario', 'alquileres temporarios'], links: [{ href: '/alquileres-temporarios', label: 'Alquileres temporarios' }] },
  { nombres: ['Don Mateo'], links: [{ href: '/barrio-don-mateo-funes', label: 'Barrio Don Mateo, Funes' }] },
  { nombres: ['Los Aromos'], links: [{ href: '/barrio-los-aromos-roldan', label: 'Barrio Los Aromos, Roldán' }] },
  { nombres: ['El Molino'], links: [{ href: '/barrio-el-molino-roldan', label: 'Barrio El Molino, Roldán' }] },
  { nombres: ['barrios privados', 'barrios cerrados', 'barrio privado', 'barrio cerrado', 'countries'], links: [{ href: '/barrios-privados', label: 'Barrios privados de Funes' }] },
  ...BARRIOS.map((b) => ({ nombres: [b.nombre], links: [{ href: `/barrios-privados/${b.slug}`, label: `Barrio ${b.nombre}` }] })),
]

/** Las páginas de localidad y de barrio que un texto menciona (sin repetir). */
export function zonasMencionadas(texto: string, max = 12): LinkZona[] {
  const t = sinAcentos(texto)
  const vistos = new Set<string>()
  const out: LinkZona[] = []
  for (const m of MENCIONES) {
    if (!m.nombres.some((n) => menciona(t, n))) continue
    for (const l of m.links) {
      if (vistos.has(l.href)) continue
      vistos.add(l.href)
      out.push(l)
    }
  }
  return out.slice(0, max)
}
