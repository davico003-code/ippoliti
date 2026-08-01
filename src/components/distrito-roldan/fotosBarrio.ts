// Separa, de las fotos que el CRM tiene cargadas en Distrito Roldán, cuáles son
// fotos reales del predio y cuáles son renders del proyecto terminado.
//
// Por qué hace falta: el CRM guarda las dos cosas mezcladas en la misma galería
// y no tiene forma de marcar cuál es cuál. La sección "El barrio hoy" promete
// imágenes reales, así que mostrar ahí un render sería vender humo.
//
// Cómo se mantiene: la lista es de RENDERS, no de fotos. Una foto nueva que se
// suba al CRM entra sola como foto real —que es el caso habitual, fotos de
// drone del avance—. Solo hay que tocar este archivo si algún día se carga un
// render nuevo. Los renders del proyecto ya tienen su propia sección
// (SeccionRenders), con archivos propios en public/images/distrito-roldan/.

/** Identificador de cada render dentro de la galería del CRM (67178). */
const RENDERS = new Set([
  '67178_101185947899372908991301551312948836516096996550647257541520772808952701575989',
  '67178_48762256170737294565632687975214966383476418125923215039454772309578335455069',
  '67178_13803461830409008553872888336977910087807065753391720166303294218233970520680',
  '67178_19986709381669903310004799992601479706708928381948995946898229160651037718816',
  '67178_108804389443825126198168971202648105884628642976951254031341719851370781838607',
  '67178_58744310816039287349548812577518569541356569538517726770714410285049707424516',
  '67178_9349230733317212684039504219410259634438945752555073092622618050535036274817',
])

/** Nombre del archivo sin extensión, que es lo que identifica a la foto. */
function idDeFoto(url: string): string {
  const archivo = url.split('/').pop() ?? ''
  return archivo.replace(/\.[a-z0-9]+$/i, '')
}

/**
 * Deja solo las fotos reales del predio. Si mañana se suben fotos nuevas al
 * CRM, aparecen acá sin tocar nada.
 */
export function soloFotosDelBarrio(fotos: string[]): string[] {
  return fotos.filter((url) => !RENDERS.has(idDeFoto(url)))
}
