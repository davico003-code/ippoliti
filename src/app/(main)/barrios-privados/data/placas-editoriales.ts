// Placas editoriales del hero de /barrios-privados (las 2 cards de la derecha).
// David las edita manualmente en este archivo cuando quiere rotar
// destacados — no hay CMS ni Upstash para esto.
//
// Las imágenes son las portadas procesadas de cada barrio
// (/public/barrios/{slug}/01.webp). El fallbackGradient queda detrás por si
// una imagen falta, para mantener la composición.

export interface PlacaEditorial {
  badge: string;
  badgeVariant: "light" | "gold";
  titulo: string;
  subtitulo: string;
  cta: string;
  href: string;
  imagen: string;             // ej. "/barrios/funes-lakes/01.webp"
  fallbackGradient: string;   // CSS gradient detrás de la imagen
}

export const PLACAS_EDITORIALES: PlacaEditorial[] = [
  {
    badge: "OPORTUNIDAD",
    badgeVariant: "light",
    titulo: "Oportunidades en Funes Lakes",
    subtitulo: "Lotes náuticos con vista a islas",
    cta: "Ver disponibilidad →",
    href: "/barrios-privados/funes-lakes",
    imagen: "/barrios/funes-lakes/01.webp",
    fallbackGradient:
      "radial-gradient(ellipse at 30% 40%, rgba(120,200,220,0.55) 0%, transparent 50%), linear-gradient(135deg, #4a8aa6 0%, #2d5a8a 50%, #1a3d5c 100%)",
  },
  {
    badge: "SORPRENDETE",
    badgeVariant: "gold",
    titulo: "Sorprendete en Vida Lagoon",
    subtitulo: "Laguna cristalina de 23.300 m²",
    cta: "Conocer el barrio →",
    href: "/barrios-privados/vida-lagoon",
    imagen: "/barrios/vida-lagoon/01.webp",
    fallbackGradient:
      "radial-gradient(ellipse at 50% 35%, rgba(150,220,210,0.65) 0%, transparent 55%), linear-gradient(160deg, #5cb3a8 0%, #2d8a8a 55%, #1a4d4d 100%)",
  },
];
