// BARRIOS PARECIDOS (David, 4-oct-2026): "si una persona está viendo un barrio,
// mostrale alguno que sea parecido, pero primero preguntale". Al terminar el
// mazo de un barrio, el Tinder pregunta "¿Te muestro casas en barrios
// parecidos?" y, si dice que sí, suma las de estos.
//
// Cada grupo son barrios que se parecen entre sí (lo dijo David; no se
// inventan). Un barrio puede estar en más de un grupo: sus parecidos son todos
// los demás de sus grupos, en el orden de la lista. Para sumar uno, agregalo
// acá con el nombre como aparece en la web (y sus otras formas en ALIAS).

const GRUPOS: string[][] = [
  ['San Sebastián', 'Aguadas', 'Vida'],
  ['Vida', 'Vida Club de Campo'],
  ['Funes Hills Cadaqués', 'Funes Hills Miraflores', 'Funes Hills San Marino'],
  ['Cantegril', 'Don Mateo'],
  // David 4-oct: "Funes Lakes puede ir con Vida Jardín" (primero) y "Vida Lagoon
  // puede ir con Funes Lakes, pero ya hay mucho en ambos barrios".
  ['Funes Lakes', 'Vida Jardín'],
  ['Vida Lagoon', 'Funes Lakes'],
]

const clave = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

/** Otras formas en que llega el mismo barrio (Tokko, la red, cómo lo escribe la gente). */
const ALIAS: Record<string, string> = {
  'barrio vida': 'vida',
  cantegrill: 'cantegril',
  'barrio cantegril': 'cantegril',
  'miraflores (funes hills)': 'funes hills miraflores',
  'san marino (funes hills)': 'funes hills san marino',
  'cadaques (funes hills)': 'funes hills cadaques',
  'barrio san sebastian': 'san sebastian',
  'don mateo ii': 'don mateo',
  'don mateo 2': 'don mateo',
  'vida crystal lagoon': 'vida lagoon',
  'vida lagoon funes': 'vida lagoon',
}

const canonica = (barrio: string) => {
  const k = clave(barrio)
  return ALIAS[k] ?? k
}

/** Los barrios parecidos a `barrio` (sin él mismo). Sin grupo: []. */
export function barriosParecidos(barrio: string | null | undefined): string[] {
  if (!barrio?.trim()) return []
  const k = canonica(barrio)
  const vistos = new Set<string>([k])
  const out: string[] = []
  for (const grupo of GRUPOS) {
    if (!grupo.some((b) => clave(b) === k)) continue
    for (const b of grupo) {
      const kb = clave(b)
      if (vistos.has(kb)) continue
      vistos.add(kb)
      out.push(b)
    }
  }
  return out
}

/** "Aguadas y Vida" / "Aguadas, Vida y Vida Club de Campo". */
export function listaBarrios(barrios: readonly string[]): string {
  if (barrios.length <= 1) return barrios[0] ?? ''
  return `${barrios.slice(0, -1).join(', ')} y ${barrios[barrios.length - 1]}`
}
