// Lo que Hilo manda para el tasador por barrio (/api/public/en-red/mercado,
// campo `tasador`; lo arma feed-en-red/tasador-zonas.ts allá).

export type TipoHiloTasador = 'casa' | 'lote' | 'depto'

export type ParamsTasador = {
  /** Avisos del barrio que entraron en la cuenta. */
  n: number
  /** USD/m²: cubierto en casas y deptos, de terreno en lotes. */
  usdM2: number
  /** Superficie típica: cubierta en casas y deptos, del lote en lotes. */
  m2Tipico: number
  loteTipico?: number | null
  antTipica?: number | null
  /** Casas: USD/m² de la tierra del barrio. */
  tierraM2?: number | null
  /** Casas: USD/m² de lo construido, ya descontada la tierra. */
  construccionM2?: number | null
  /** La mitad de las publicadas queda a menos de esto de la cuenta (0,18 = 18 %). */
  error: number
  /** ¿Se da número acá? Lo decide Hilo (avisos propios suficientes y error aceptable). */
  daNumero: boolean
  /** ¿El error es del barrio (o el de su ciudad, porque el barrio tiene pocos avisos)? */
  errorPropio: boolean
}

export type ModeloTasador = {
  /** La versión de la cuenta: si no coincide con VERSION_ESTIMAR, no se da número. */
  version: number
  curvaEdad: { casa: number[]; depto: number[] }
  beta: Record<TipoHiloTasador, number>
  mixto: Record<string, boolean>
  errorCiudad: Record<string, Partial<Record<TipoHiloTasador, number>>>
}

/** Una zona del catálogo con sus números del tasador. La ciudad = lo que no está en ningún barrio (el casco). */
export type TasadorZona = { nombre: string; ciudad: string | null; esCiudad: boolean; params: Partial<Record<TipoHiloTasador, ParamsTasador>> }

export type Tasador = { modelo: ModeloTasador; zonas: TasadorZona[] }
