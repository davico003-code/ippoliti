export interface CTA {
  id: 'web' | 'instagram' | 'whatsapp';
  texto: string;
  tono: 'informativo' | 'social' | 'directo';
}

export const CTAS: CTA[] = [
  {
    id: 'web',
    texto:
      'Visitá siinmobiliaria.com para ver propiedades seleccionadas en Funes, Roldán y Rosario, o contactanos para una consulta personalizada.',
    tono: 'informativo',
  },
  {
    id: 'instagram',
    texto:
      'Para análisis regulares del mercado inmobiliario en el oeste del Gran Rosario, seguinos en Instagram @inmobiliaria.si.',
    tono: 'social',
  },
  {
    id: 'whatsapp',
    texto:
      'En SI Inmobiliaria trabajamos todos los días con personas evaluando cómo invertir mejor su capital. Consultanos por WhatsApp al +54 341 210-1694 o visitá siinmobiliaria.com.',
    tono: 'directo',
  },
];

export function seleccionarCTA(notasRecientes: string[]): CTA {
  const conteo = CTAS.map((cta) => ({
    cta,
    usos: notasRecientes.filter((n) => n.includes(cta.id)).length,
  }));
  return conteo.sort((a, b) => a.usos - b.usos)[0].cta;
}
