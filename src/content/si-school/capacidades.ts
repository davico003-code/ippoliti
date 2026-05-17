// Metadata de las 6 capacidades del programa SI School.
// Estado base (sin progreso): Cap I activa, II-VI bloqueadas.
// El estado real por agente se calcula contra AgentProgress en runtime.

import type { CapacidadMeta } from '@/lib/si-school/types'

export const CAPACIDADES_META: CapacidadMeta[] = [
  {
    slug: 'capacidad-01',
    numero: 1,
    romano: 'I',
    titulo: 'Pensar como SI',
    subtitulo: 'Los 3 principios y la frase fundacional',
    descripcion: 'El sistema operativo mental. Antes de cualquier herramienta, los criterios que te van a guiar en cada decisión.',
    estado: 'activa',
  },
  {
    slug: 'capacidad-02',
    numero: 2,
    romano: 'II',
    titulo: 'Construir presencia y autoridad',
    subtitulo: 'De agente nuevo a referente del barrio',
    descripcion: 'Cómo se construye reputación local antes de tener volumen de operaciones. Identidad, redes, comunidad.',
    estado: 'bloqueada',
  },
  {
    slug: 'capacidad-03',
    numero: 3,
    romano: 'III',
    titulo: 'Captar con criterio SI',
    subtitulo: 'Cómo construir cartera con salud',
    descripcion: 'NURC, entrevista, Acuerdo de Comercialización Digital. El sistema de captación de SI para no perder tiempo con propiedades inviables.',
    estado: 'bloqueada',
  },
  {
    slug: 'capacidad-04',
    numero: 4,
    romano: 'IV',
    titulo: 'Conducir conversaciones con compradores',
    subtitulo: 'El sistema de selección con feedback de SI',
    descripcion: 'Cómo conducir un lead desde la primera consulta hasta una visita real. NURC para compradores, selección curada, feedback estructurado.',
    estado: 'bloqueada',
  },
  {
    slug: 'capacidad-05',
    numero: 5,
    romano: 'V',
    titulo: 'Cerrar operaciones',
    subtitulo: 'Del gancho a la escritura',
    descripcion: 'Negociación, oferta, referéndum, seña a 48 horas y acompañamiento hasta la escritura. El sistema SI para cerrar bien y no perder al cliente en el camino.',
    estado: 'bloqueada',
  },
  {
    slug: 'capacidad-06',
    numero: 6,
    romano: 'VI',
    titulo: 'Sostener la cartera',
    subtitulo: 'Postventa, referidos, relación de década',
    descripcion: 'Cómo se transforma una operación cerrada en 3-10 operaciones futuras.',
    estado: 'bloqueada',
  },
]
