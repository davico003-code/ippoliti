// Metadata de las 6 capacidades del programa SI School.
// Estado base (sin progreso): Cap I activa, II-VI bloqueadas.
// El estado real por agente se calcula contra AgentProgress en runtime.

import type { CapacidadMeta } from '@/lib/si-school/types'

export const CAPACIDADES_META: CapacidadMeta[] = [
  {
    slug: 'capacidad-01',
    numero: 1,
    romano: '1',
    titulo: 'Pensar como SI',
    subtitulo: 'Los 3 principios y la frase fundacional',
    descripcion: 'El sistema operativo mental. Antes de cualquier herramienta, los criterios que te van a guiar en cada decisión.',
    estado: 'activa',
  },
  {
    slug: 'capacidad-02',
    numero: 2,
    romano: '2',
    titulo: 'Construir presencia y autoridad',
    subtitulo: 'De agente nuevo a referente del barrio',
    descripcion: 'Cómo se construye reputación local antes de tener volumen de operaciones. Identidad, redes, comunidad.',
    estado: 'bloqueada',
  },
  {
    slug: 'capacidad-03',
    numero: 3,
    romano: '3',
    titulo: 'Captar con criterio SI',
    subtitulo: 'Cómo construir cartera con salud',
    descripcion: 'NURC, entrevista, Acuerdo de Comercialización Digital. El sistema de captación de SI para no perder tiempo con propiedades inviables.',
    estado: 'bloqueada',
  },
  {
    slug: 'capacidad-04',
    numero: 4,
    romano: '4',
    titulo: 'Conducir conversaciones con compradores',
    subtitulo: 'El sistema de selección con feedback de SI',
    descripcion: 'Cómo conducir un lead desde la primera consulta hasta una visita real. NURC para compradores, selección curada, feedback estructurado.',
    estado: 'bloqueada',
  },
  {
    slug: 'capacidad-05',
    numero: 5,
    romano: '5',
    titulo: 'Cerrar operaciones',
    subtitulo: 'Del gancho a la escritura',
    descripcion: 'Negociación, oferta, referéndum, seña a 48 horas y acompañamiento hasta la escritura. El sistema SI para cerrar bien y no perder al cliente en el camino.',
    estado: 'bloqueada',
  },
  {
    slug: 'capacidad-06',
    numero: 6,
    romano: '6',
    titulo: 'Sostener la cartera',
    subtitulo: 'Lo que define tu carrera a 10 años',
    descripcion: 'Postventa, referidos activos, métricas personales y los 4 niveles de carrera del agente SI. El oficio de sostener cartera viva en el tiempo.',
    estado: 'bloqueada',
  },
]
