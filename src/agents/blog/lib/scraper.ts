import type { Fuente } from '../config/sources';

export interface Titular {
  titulo: string;
  url: string;
  fecha?: Date;
  resumen?: string;
  fuente: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function scrapearTitulares(fuente: Fuente): Promise<Titular[]> {
  throw new Error('Implementar en Fase 2');
}
