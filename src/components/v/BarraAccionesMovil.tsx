'use client'

// Barra fija abajo en celular/tablet (<1024): "¿Te gusta?" + Compartir.
// Reemplaza al botón flotante azul (tapaba contenido) y a las tarjetas
// "¿Qué te parece?" / "¿Te interesa?" del final. "¿Te gusta?" abre una hoja
// con las 3 opciones; después muestra lo elegido.

import { useEffect, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import CompartirMenu from './CompartirMenu'
import { OPCIONES_VOTO, VotoColega, useVotoColega } from '@/components/neutral/FeedbackColega'
import { APAGADO, FONDO_SUAVE, LINEA, TINTA } from './estilos'

export default function BarraAccionesMovil({ url, slug }: { url: string; slug: string }) {
  const [hoja, setHoja] = useState(false)
  const { choice } = useVotoColega(slug)
  const elegido = OPCIONES_VOTO.find(o => o.key === choice)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hoja) return
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setHoja(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHoja(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [hoja])

  return (
    <div
      ref={wrapRef}
      className="lg:hidden"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        background: 'rgba(255,255,255,0.97)',
        borderTop: `1px solid ${LINEA}`,
        padding: '10px 16px calc(10px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {hoja && (
        <div
          role="dialog"
          aria-label="¿Qué te parece esta propiedad?"
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 'calc(100% + 10px)',
            background: '#fff',
            border: `1px solid ${LINEA}`,
            borderRadius: 18,
            padding: 16,
            boxShadow: '0 10px 32px rgba(0,0,0,0.16)',
          }}
        >
          <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: TINTA }}>¿Qué te parece esta propiedad?</p>
          <VotoColega slug={slug} apilado onVoto={() => setTimeout(() => setHoja(false), 900)} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, maxWidth: 720, margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => setHoja(h => !h)}
          aria-expanded={hoja}
          style={{
            height: 48,
            padding: '0 16px',
            border: 'none',
            borderRadius: 14,
            background: FONDO_SUAVE,
            color: TINTA,
            fontSize: 15,
            fontWeight: 600,
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          {elegido ? (
            <>
              <span aria-hidden style={{ fontSize: 16 }}>{elegido.emoji}</span>
              <span style={{ color: APAGADO }}>{elegido.corto}</span>
            </>
          ) : (
            <>
              <Heart size={18} aria-hidden />
              ¿Te gusta?
            </>
          )}
        </button>
        <CompartirMenu url={url} slug={slug} variante="barra" />
      </div>
    </div>
  )
}
