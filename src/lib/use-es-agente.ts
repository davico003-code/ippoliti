'use client'

// ¿Quien mira es un asesor de SI con sesión? (25-oct-2026)
//
// Las herramientas de asesor ("Link para colega", "Crear placa") estaban en el
// menú Compartir de CUALQUIER visitante: un comprador veía opciones internas
// que no entiende. Ahora solo aparecen con sesión de agente. Una sola consulta
// a /api/agentes/me por carga de página (la promesa queda en el módulo), así
// cada botón de compartir no dispara la suya.
//
// Hasta que responde, devuelve false: el visitante común nunca ve un parpadeo
// de opciones internas. El asesor las ve un instante después.

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
