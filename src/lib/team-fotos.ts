// Ruta de la foto de /public/team a partir del slug (nombre sin tildes).
// Las fotos rehechas van con sufijo -v2: next/image cachea 31 días por URL
// (minimumCacheTTL), así que pisar el archivo con el mismo nombre no se vería.
const REHECHAS = new Set([
  'david-flores', 'gino-pecchenino', 'gisela-ramallo', 'laura-flores',
  'leticia-alexenicer', 'lucia-wilson', 'mauro-matteucci', 'susana-ippoliti',
])

export const fotoTeam = (slug: string) => `/team/${slug}${REHECHAS.has(slug) ? '-v2' : ''}.jpg`
