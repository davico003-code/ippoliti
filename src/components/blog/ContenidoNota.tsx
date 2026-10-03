import Image from 'next/image'
import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'
import { parsearNota, type Bloque, type Inline } from '@/lib/blog-markdown'

// Cuerpo de una nota del blog. El parseo vive en lib/blog-markdown.ts; acá
// solo se arman elementos React (el texto lo escapa React, sin innerHTML).

const CLASE_LINK =
  'font-semibold text-[#1A5C38] underline decoration-[#1A5C38]/30 underline-offset-[3px] transition-colors hover:decoration-[#1A5C38]'
const CLASE_TEXTO = 'text-[17px] leading-[1.8] text-gray-700 md:text-lg'
const CLASE_CAPITULAR =
  'first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:text-[3.4rem] first-letter:font-black first-letter:leading-[0.8] first-letter:text-[#1A5C38]'

function renderInline(nodos: Inline[]): ReactNode[] {
  return nodos.map((n, i) => {
    switch (n.tipo) {
      case 'texto':
        return <Fragment key={i}>{n.valor}</Fragment>
      case 'salto':
        return <br key={i} />
      case 'negrita':
        return <strong key={i} className="font-bold text-gray-900">{renderInline(n.hijos)}</strong>
      case 'cursiva':
        return <em key={i}>{renderInline(n.hijos)}</em>
      case 'link': {
        const hijos = renderInline(n.hijos)
        // URL no permitida: queda el texto, sin link y sin el markdown crudo.
        if (!n.href) return <Fragment key={i}>{hijos}</Fragment>
        if (n.externo) {
          return (
            <a key={i} href={n.href} target="_blank" rel="noopener noreferrer" className={CLASE_LINK}>
              {hijos}
            </a>
          )
        }
        return (
          <Link key={i} href={n.href} className={CLASE_LINK}>
            {hijos}
          </Link>
        )
      }
    }
  })
}

function renderBloque(b: Bloque, i: number, capitular: boolean, altPorDefecto: string): ReactNode {
  switch (b.tipo) {
    case 'titulo':
      return b.nivel === 2 ? (
        <h2 key={i} className="mb-2 mt-12 text-[1.6rem] font-black leading-tight tracking-tight text-gray-900">
          {renderInline(b.hijos)}
        </h2>
      ) : (
        <h3 key={i} className="mb-1 mt-8 text-xl font-bold leading-snug text-gray-900">
          {renderInline(b.hijos)}
        </h3>
      )
    case 'parrafo':
      return (
        <p key={i} className={`${CLASE_TEXTO} ${capitular ? CLASE_CAPITULAR : ''}`}>
          {renderInline(b.hijos)}
        </p>
      )
    case 'lista': {
      const items = b.items.map((item, j) => (
        <li key={j} className="pl-1.5">
          {renderInline(item)}
        </li>
      ))
      return b.ordenada ? (
        <ol
          key={i}
          start={b.inicio !== 1 ? b.inicio : undefined}
          className={`${CLASE_TEXTO} list-decimal space-y-2 pl-6 marker:font-bold marker:text-[#1A5C38]`}
        >
          {items}
        </ol>
      ) : (
        <ul key={i} className={`${CLASE_TEXTO} list-disc space-y-2 pl-6 marker:text-[#1A5C38]`}>
          {items}
        </ul>
      )
    }
    case 'cita':
      return (
        <blockquote key={i} className="space-y-3 border-l-4 border-[#1A5C38] pl-5 text-[17px] italic leading-[1.8] text-gray-600 md:text-lg">
          {b.parrafos.map((p, j) => (
            <p key={j}>{renderInline(p)}</p>
          ))}
        </blockquote>
      )
    case 'separador':
      return <hr key={i} className="my-10 border-gray-200" />
    case 'imagen':
      return (
        <figure key={i} className="my-10 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={b.src}
              alt={b.alt || altPorDefecto}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
          {b.alt && (
            <figcaption className="px-4 py-3 text-sm leading-relaxed text-gray-500">{b.alt}</figcaption>
          )}
        </figure>
      )
  }
}

export default function ContenidoNota({ contenido, titulo }: { contenido: string; titulo: string }) {
  const bloques = parsearNota(contenido)
  // Capitular solo en el primer bloque de texto, si es un párrafo que arranca
  // con letra (no en una lista ni en una cita).
  const primero = bloques.findIndex((b) => b.tipo !== 'titulo' && b.tipo !== 'imagen')
  const pb = bloques[primero]
  const conCapitular =
    pb?.tipo === 'parrafo' && pb.hijos[0]?.tipo === 'texto' && /^[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(pb.hijos[0].valor)

  return (
    <div className="space-y-6">
      {bloques.map((b, i) => renderBloque(b, i, conCapitular && i === primero, titulo))}
    </div>
  )
}
