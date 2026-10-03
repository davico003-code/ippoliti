import { Redis } from '@upstash/redis';

// Contexto económico real para el writer: los mismos datos que muestra
// /informes (cron api/cron/informes → Redis informes:data). Antes era un
// texto fijo y el writer completaba con números inventados.

interface Serie {
  datos?: { fecha: string; valor: number }[];
}

interface Dolar {
  venta?: number;
  fechaActualizacion?: string;
}

interface InformesData {
  dolar?: Record<string, Dolar>;
  ipc?: Serie;
  icl?: Serie;
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function mes(fecha: string): string {
  const [y, m] = fecha.split('-');
  return `${MESES[Number(m) - 1]} ${y}`;
}

const fmt = (n: number, dec = 0) => n.toLocaleString('es-AR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

export async function obtenerContextoEconomico(): Promise<string> {
  let data: InformesData | null = null;
  try {
    const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! });
    const raw = await redis.get<string | InformesData>('informes:data');
    data = typeof raw === 'string' ? (JSON.parse(raw) as InformesData) : raw;
  } catch {
    /* sin datos: se avisa abajo */
  }
  if (!data) return 'No hay datos macro disponibles hoy: no uses cifras de inflación, dólar ni índices.';

  const lineas: string[] = [];
  const ipc = data.ipc?.datos?.slice(-6) ?? [];
  if (ipc.length) {
    lineas.push(`- Inflación mensual (IPC, INDEC): ${ipc.map((d) => `${mes(d.fecha)} ${fmt(d.valor, 1)}%`).join(', ')}.`);
  }
  const icl = data.icl?.datos ?? [];
  if (icl.length >= 2) {
    const ult = icl[icl.length - 1];
    lineas.push(`- ICL (BCRA), último valor: ${fmt(ult.valor, 2)} a ${mes(ult.fecha)}.`);
  }
  for (const [casa, d] of Object.entries(data.dolar ?? {})) {
    if (d?.venta) {
      lineas.push(`- Dólar ${casa} (venta): $${fmt(d.venta)}${d.fechaActualizacion ? ` al ${d.fechaActualizacion.slice(0, 10)}` : ''}.`);
    }
  }
  return lineas.length
    ? `Datos oficiales al día (usalos con su fuente y fecha; para acumular porcentajes mensuales se multiplican, no se suman):\n${lineas.join('\n')}`
    : 'No hay datos macro disponibles hoy: no uses cifras de inflación, dólar ni índices.';
}
