'use client'

// ¿Quien mira es un asesor de SI con sesión? (25-oct-2026)
//
// Con sesión de agente, el menú Compartir suma "Compartir…" (la hoja nativa del
// celu) y, en tarjetas y mapa, "Crear placa". "Link para colega" y la placa de
// la ficha NO dependen de esto: son para todos, porque el equipo comparte desde
// la web sin iniciar sesión (10-nov-2026; del 7 al 10 quedaron detrás de la
// sesión y el equipo se quedó sin esas opciones en el celu). Una sola consulta
// a /api/agentes/me por carga de página (la promesa queda en el módulo), así
// cada botón de compartir no dispara la suya.
//
// Hasta que responde, devuelve false: el visitante común nunca ve un parpadeo
// de opciones de asesor. El asesor las ve un instante después.

import { useEffect, useState } from 'react'

let consulta: Promise<boolean> | null = null

function consultarSesion(): Promise<boolean> {
  if (!consulta) {
    consulta = fetch('/api/agentes/me', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then((d: { agent?: unknown } | null) => !!d?.agent)
      .catch(() => {
        consulta = null // red caída: que el próximo botón vuelva a intentar
        return false
      })
  }
  return consulta
}

export function useEsAgente(): boolean {
  const [es, setEs] = useState(false)
  useEffect(() => {
    let vivo = true
    consultarSesion().then(v => {
      if (vivo) setEs(v)
    })
    return () => {
      vivo = false
    }
  }, [])
  return es
}
