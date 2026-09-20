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

// ?pantalla=completa: el plano se centra solo adentro del iframe y la hoja del
// lote llega al borde inferior real de la pantalla (06-sep-2026). Por eso acá
// el iframe mide como mínimo 100dvh y ya no hace falta centrarlo desde afuera.

// Estado del plano que viaja en el link compartido: capas prendidas (?ver=),
// tipo de lote (?tipo=) y lote abierto (?lote=). El plano avisa cada cambio
// por postMessage y lo reflejamos en la URL de esta página, que es la que se
// comparte; al abrir el link se lo pasamos al iframe. El resto de los
// parámetros (utm_*, fbclid) no se toca.
const PARAMS_PLANO = ['ver', 'tipo', 'lote'] as const

export default function PlanoPantallaCompleta() {
  const [alto, setAlto] = useState<number | null>(null)
  // null hasta leer la URL en el cliente: si el iframe arrancara sin los parámetros y
  // después cambiara, el plano se cargaría dos veces.
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    const actual = new URLSearchParams(window.location.search)
    const q = new URLSearchParams({ pantalla: 'completa' })
    for (const k of PARAMS_PLANO) {
      const v = actual.get(k)
      if (v) q.set(k, v)
    }
    setSrc(`/planos/distrito-roldan.html?${q.toString()}`)
  }, [])

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      const d = e.data as { type?: string; h?: number; q?: string } | null
      if (d && d.type === 'plano-height' && typeof d.h === 'number') {
        setAlto(Math.max(420, Math.min(3000, Math.round(d.h))))
      }
      if (d && d.type === 'plano-estado' && typeof d.q === 'string') {
        const url = new URL(window.location.href)
        const delPlano = new URLSearchParams(d.q)
        for (const k of PARAMS_PLANO) {
          const v = delPlano.get(k)
          if (v) url.searchParams.set(k, v)
          else url.searchParams.delete(k)
        }
        // ver=d,v y no ver=d%2Cv: el link se lee mejor al pegarlo en WhatsApp.
        const nueva = url.href.replace(/%2C/gi, ',')
        if (nueva !== window.location.href) window.history.replaceState(window.history.state, '', nueva)
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
        background: '#F4F5F3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <iframe
        src={src ?? undefined}
        title="Plano interactivo de lotes — Distrito Roldán"
        style={{
          display: 'block',
          width: '100%',
          height: alto ? `max(${alto}px, 100dvh)` : '420px',
          border: 0,
          opacity: alto ? 1 : 0,
          transition: 'opacity .25s ease',
        }}
      />
    </main>
  )
}
