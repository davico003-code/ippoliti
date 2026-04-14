/**
 * Stub — Fase futura: scrapear BCRA, CAC e inyectar datos macro reales.
 * Por ahora devuelve un disclaimer fijo para el prompt del radar.
 */
export async function obtenerContextoEconomico(): Promise<string> {
  return 'Datos macro: revisar manualmente BCRA y CAC esta semana antes de aprobar temas.';
}
