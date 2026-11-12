import type { TokkoVideo } from '@/lib/tokko'
import { youtubeId } from '@/lib/videos-vivos'

// Hilo pone el video de la oficina de Funes ("Nuestra oficina en Funes") POR
// DEFECTO en las propiedades que todavía no tienen su recorrido, para que
// ninguna quede sin video (Hilo: src/lib/propiedades/default-video.ts, mismo
// id). En la ficha no puede llamarse "Recorrido en video": quien lo abre espera
// la casa (21-oct-2026: 117 de las 205 fichas con video eran este). Va al final,
// como "Conocé nuestra oficina", y sin pestaña "Video".
export const VIDEO_OFICINA_ID = '4zu7ACCErzk'

export const esVideoOficina = (v: TokkoVideo) => youtubeId(v) === VIDEO_OFICINA_ID

/** Los recorridos de la propiedad (sin el video de la oficina). */
export function videosPropios(videos: TokkoVideo[] | null | undefined): TokkoVideo[] {
  return (videos ?? []).filter((v) => !esVideoOficina(v))
}

/** El video de la oficina, solo si la propiedad no tiene recorrido propio. */
export function videoOficinaSolo(videos: TokkoVideo[] | null | undefined): TokkoVideo[] {
  const lista = videos ?? []
  return videosPropios(lista).length > 0 ? [] : lista.filter(esVideoOficina).slice(0, 1)
}
