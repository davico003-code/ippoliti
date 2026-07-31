'use client'

// Plano de Distrito Roldán a pantalla completa, para el link que se manda por
// WhatsApp. Acá el plano es lo único que hay en la página.
//
// El plano avisa su altura real por postMessage y con eso le damos al iframe
// la altura exacta. Importa el orden: si el iframe arrancara ocupando toda la
// pantalla, el plano mediría ese alto y devolvería el del iframe en vez del
// suyo. Por eso arranca chico y escondido, y aparece recién cuando sabemos
// cuánto mide de verdad — así tampoco se ve el salto de tamaño.
//
// Con la altura real lo centramos: en un celular el plano entra entero y queda
// con aire arriba y abajo, en vez de pegado al techo con un hueco de papel.

import { useEffect, useState } from 'react'

const SRC = '/planos/distrito-roldan.html'

export default function PlanoPantallaCompleta() {
  const [alto, setAlto] = useState<number | null>(null)

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; h?: number } | null
      if (d && d.type === 'plano-height' && typeof d.h === 'number') {
        setAlto(Math.max(420, Math.min(3000, Math.round(d.h))))
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  return (
    <main
      style={{
        // 100dvh y no 100vh: en el navegador del celular la barra de
        // direcciones se esconde al scrollear y con vh el plano quedaba cortado.
        minHeight: '100dvh',
        width: '100%',
        background: '#EDE7DA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <iframe
        src={SRC}
        title="Plano interactivo de lotes — Distrito Roldán"
        style={{
          display: 'block',
          width: '100%',
          height: alto ? `${alto}px` : '420px',
          border: 0,
          opacity: alto ? 1 : 0,
          transition: 'opacity .25s ease',
        }}
      />
    </main>
  )
}
