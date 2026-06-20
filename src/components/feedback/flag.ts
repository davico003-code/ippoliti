// Flag global del sistema de feedback. Default OFF: si la env var no está en
// '1'/'true', NINGÚN componente de feedback se renderiza.
//
// NEXT_PUBLIC_* se inlinea en build, así que esto se evalúa a una constante.
export const FEEDBACK_ENABLED =
  process.env.NEXT_PUBLIC_FEEDBACK_ENABLED === '1' ||
  process.env.NEXT_PUBLIC_FEEDBACK_ENABLED === 'true'
