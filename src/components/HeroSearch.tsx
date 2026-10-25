'use client'

// Buscador de la portada de la compu. Es el MISMO componente que el del celu
// (home/SugerenciasBusqueda.tsx): antes eran dos copias que hablaban distinto
// (otro placeholder, otros tamaños, otra letra) y las mejoras llegaban a una
// sola. Lo que cambia entre los dos es solo el aire (padding y ancho).
import { BuscadorHero } from './home/SugerenciasBusqueda'

export default function HeroSearch() {
  return <BuscadorHero variante="compu" />
}
