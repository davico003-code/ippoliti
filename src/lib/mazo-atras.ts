// El "atrás" del navegador con el Tinder abierto (MazoCasas, 4-oct-2026): lo
// maneja el mazo (pregunta antes de salir). Mientras esta marca está puesta,
// los demás que escuchan popstate —la ficha de la compu, PropertyPanel— lo
// ignoran: en la ventana se ejecutan en el orden en que se registraron y no hay
// forma de que el mazo se adelante.

const ATRIBUTO = 'data-mazo-abierto'

export function marcarMazoAbierto(abierto: boolean): void {
  if (abierto) document.documentElement.setAttribute(ATRIBUTO, '')
  else document.documentElement.removeAttribute(ATRIBUTO)
}

/** ¿El atrás de este momento es del mazo? */
export function atrasEsDelMazo(): boolean {
  return typeof document !== 'undefined' && document.documentElement.hasAttribute(ATRIBUTO)
}
