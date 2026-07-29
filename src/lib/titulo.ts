// Normalización de títulos de publicación.
//
// Algunos avisos se cargan en el CRM con el título TODO EN MAYÚSCULAS
// ("DEPARTAMENTO DE 3 DORMITORIOS CON BALCON AL FRENTE"). En la ficha, en las
// cards y en las placas eso se lee como un grito y desentona con el resto del
// inventario. Acá lo pasamos a mayúscula/minúscula normal.
//
// Solo actúa cuando el título está ÍNTEGRAMENTE en mayúsculas: si el agente
// escribió con formato propio (mayúsculas parciales, nombres propios), no se
// toca nada.
//
// Ojo: no cambia el slug. generatePropertySlug pasa todo a minúsculas, así que
// normalizar el título no altera las URLs ya publicadas.

// Palabras que van en minúscula dentro de la frase (artículos, preposiciones,
// conjunciones). "de 3 dormitorios con balcón al frente".
const MINUSCULAS = new Set([
  'a', 'al', 'ante', 'bajo', 'con', 'contra', 'de', 'del', 'desde', 'e', 'el',
  'en', 'entre', 'hacia', 'hasta', 'la', 'las', 'lo', 'los', 'o', 'para', 'por',
  'según', 'sin', 'sobre', 'tras', 'u', 'un', 'una', 'unos', 'unas', 'y',
])

// Términos del rubro que se escriben con mayúscula o llevan tilde y que el
// CRM suele mandar sin acentuar cuando el título viene en mayúsculas.
const CORRECCIONES: Record<string, string> = {
  balcon: 'balcón',
  garage: 'garage',
  duplex: 'dúplex',
  triplex: 'tríplex',
  semipiso: 'semipiso',
  baulera: 'baulera',
  cochera: 'cochera',
  ph: 'PH',
  roldan: 'Roldán',
  rosario: 'Rosario',
  funes: 'Funes',
  fisherton: 'Fisherton',
  martin: 'Martin',
  pichincha: 'Pichincha',
  echesortu: 'Echesortu',
  abasto: 'Abasto',
  centro: 'Centro',
  belgrano: 'Belgrano',
  alberdi: 'Alberdi',
  'dorm.': 'dorm.',
  m2: 'm²',
}

function esTodoMayusculas(texto: string): boolean {
  const letras = texto.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '')
  // Pedimos un mínimo de letras para no "corregir" siglas cortas (PH, DUX).
  return letras.length > 6 && letras === letras.toLocaleUpperCase('es-AR')
}

function capitalizar(palabra: string): string {
  if (!palabra) return palabra
  return palabra.charAt(0).toLocaleUpperCase('es-AR') + palabra.slice(1)
}

/**
 * Devuelve el título en mayúscula/minúscula si venía todo en mayúsculas.
 * Si ya tiene formato propio, lo devuelve intacto.
 */
export function normalizarTitulo(titulo: string | null | undefined): string {
  const t = (titulo ?? '').trim()
  if (!t || !esTodoMayusculas(t)) return t

  const palabras = t.toLocaleLowerCase('es-AR').split(/(\s+)/)
  let primeraReal = true

  return palabras
    .map((token) => {
      // Preserva los separadores tal cual.
      if (/^\s+$/.test(token)) return token

      const limpio = token.replace(/[^a-záéíóúüñ0-9².]/gi, '')
      const corregido = CORRECCIONES[limpio]
      if (corregido) {
        const reemplazo = token.replace(limpio, corregido)
        // Un nombre propio o sigla ya viene con su forma correcta.
        if (corregido !== corregido.toLocaleLowerCase('es-AR')) {
          primeraReal = false
          return reemplazo
        }
        if (primeraReal) {
          primeraReal = false
          return capitalizar(reemplazo)
        }
        return MINUSCULAS.has(limpio) ? reemplazo : reemplazo
      }

      if (primeraReal) {
        primeraReal = false
        return capitalizar(token)
      }
      // Dentro de la frase: artículos y preposiciones en minúscula, el resto
      // también (sentence case) — así queda como el resto del inventario.
      return token
    })
    .join('')
}
