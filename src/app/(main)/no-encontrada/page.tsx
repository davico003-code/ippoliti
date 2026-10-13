import { notFound } from 'next/navigation'

// Destino interno del middleware para las fichas de propiedades que no existen
// o ya no están publicadas: muestra el "no encontrada" del sitio (not-found.tsx
// de (main), con el link al listado) y responde 404 de verdad. La ruta
// /propiedades/[slug] no puede hacerlo sola: su notFound() sale con 200.
export default function NoEncontrada() {
  notFound()
}
