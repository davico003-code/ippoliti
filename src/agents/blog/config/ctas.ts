// Cierres de las notas: en vez de rotar "seguinos en Instagram / visitá la
// web", cada nota lleva al lector a la herramienta del sitio que le sirve
// para el tema que acaba de leer (pedido de David, 03-oct-2026). El writer
// elige uno y lo escribe con sus palabras, con el link tal cual.

export type CtaId =
  | 'ajuste-alquiler'
  | 'costos-alquilar'
  | 'tasacion'
  | 'costos-construccion'
  | 'terrenos'
  | 'informes'
  | 'propiedades'
  | 'consulta';

export interface CTA {
  id: CtaId;
  link: string;
  para: string; // cuándo usarlo
  idea: string; // qué ofrece, para que el writer lo cuente con sus palabras
}

export const CTAS: CTA[] = [
  {
    id: 'ajuste-alquiler',
    link: '/recursos/ajuste-alquiler',
    para: 'inquilinos o propietarios con un contrato vigente: aumentos, índices, IPC, ICL',
    idea: 'calculadora que revisa si el aumento del alquiler está bien calculado con los índices oficiales',
  },
  {
    id: 'costos-alquilar',
    link: '/recursos/calculadora-alquiler',
    para: 'quien está por alquilar: requisitos, garantías, cuánto hay que juntar para entrar',
    idea: 'calculadora del total para entrar a un alquiler: adelanto, depósito, honorarios y sellado',
  },
  {
    id: 'tasacion',
    link: '/tasaciones',
    para: 'propietarios que piensan vender o quieren saber cuánto vale su casa o lote',
    idea: 'tasación de la propiedad con comparables reales de la zona',
  },
  {
    id: 'costos-construccion',
    link: '/recursos/costos-de-construccion',
    para: 'quien piensa construir, ampliar o refaccionar; costo del m², materiales, mano de obra',
    idea: 'valores actualizados del m² de construcción por calidad de terminación',
  },
  {
    id: 'terrenos',
    link: '/terrenos-roldan',
    para: 'lotes, loteos, infraestructura de barrios, valor de la tierra (usar /terrenos-funes si la nota es de Funes)',
    idea: 'los lotes disponibles hoy con precio, medidas y servicios',
  },
  {
    id: 'informes',
    link: '/informes',
    para: 'mercado, precios, dólar, créditos hipotecarios, costo de construcción como indicador',
    idea: 'tablero con la evolución del dólar, el costo de construcción y el ajuste de alquileres',
  },
  {
    id: 'propiedades',
    link: '/propiedades',
    para: 'quien está buscando dónde vivir: barrios, comparativas Funes/Roldán, vida en la zona',
    idea: 'el listado de propiedades en venta y alquiler con filtros por barrio y precio',
  },
  {
    id: 'consulta',
    link: 'https://wa.me/5493413340916',
    para: 'casos que necesitan mirar papeles o la situación puntual (escrituras, herencias, contratos)',
    idea: 'escribirnos por WhatsApp con el caso concreto y lo miramos',
  },
];

export const CTA_IDS = CTAS.map((c) => c.id);

export function catalogoCTAsParaPrompt(): string {
  return CTAS.map((c) => `- ${c.id} → ${c.link} · para: ${c.para} · ofrece: ${c.idea}`).join('\n');
}
