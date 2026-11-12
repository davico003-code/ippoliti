import Link from 'next/link'
import { informesGuardados, mesDe, pesos, porcentaje, variacion12, type InformesGuardados } from '@/lib/informes-datos'

// Lo que Google (y quien llega sin JavaScript) lee de /informes. El dashboard
// de gráficos es client-only (ssr:false): la página llegaba al índice con el
// título y 170 palabras, y Search Console la dejó en "rastreada, sin indexar"
// (23-oct-2026). Acá van los números de hoy en prosa y qué hacer con ellos,
// renderizados en el server con los mismos datos del dashboard.

const fechaLarga = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' })

function Dato({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <dt className="text-sm font-semibold text-gray-700">{etiqueta}</dt>
      <dd className="mt-1">
        <span className="block text-2xl font-bold font-numeric text-[#1A5C38]">{valor}</span>
        <span className="block text-xs text-gray-500 mt-1">{detalle}</span>
      </dd>
    </div>
  )
}

function Lectura({ g }: { g: InformesGuardados }) {
  const { data } = g
  const oficial = data.dolar?.oficial
  const blue = data.dolar?.blue
  const mep = data.dolar?.mep
  const ipcUlt = data.ipc?.datos?.at(-1) ?? null
  const ipc12 = data.ipc?.interanual?.valor ?? null
  const iclUlt = data.icl?.ultimo ?? data.icl?.datos?.at(-1) ?? null
  const icl12 = variacion12(data.icl?.datos)
  const dolar12 = variacion12(data.dolarHistorico?.datos)

  const datos: { etiqueta: string; valor: string; detalle: string }[] = []
  if (oficial) datos.push({ etiqueta: 'Dólar oficial', valor: pesos(oficial.venta), detalle: `compra ${pesos(oficial.compra)} · venta` })
  if (blue) datos.push({ etiqueta: 'Dólar blue', valor: pesos(blue.venta), detalle: `compra ${pesos(blue.compra)} · venta` })
  if (ipcUlt) datos.push({ etiqueta: 'Inflación mensual', valor: porcentaje(ipcUlt.valor), detalle: `IPC de ${mesDe(ipcUlt.fecha)}${ipc12 != null ? ` · ${porcentaje(ipc12)} interanual` : ''}` })
  if (iclUlt) datos.push({ etiqueta: 'ICL alquileres', valor: iclUlt.valor.toLocaleString('es-AR', { maximumFractionDigits: 2 }), detalle: icl12 != null ? `${icl12 >= 0 ? '+' : ''}${porcentaje(icl12)} en doce meses` : 'Índice para Contratos de Locación' })

  return (
    <>
      {datos.length > 0 && (
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {datos.map((d) => <Dato key={d.etiqueta} {...d} />)}
        </dl>
      )}
      <div className="space-y-4 text-[15px] leading-relaxed text-gray-700">
        {oficial && (
          <p>
            El dólar oficial cotiza a <strong className="font-numeric">{pesos(oficial.venta)}</strong> para la venta
            {blue ? <>, el blue a <strong className="font-numeric">{pesos(blue.venta)}</strong></> : null}
            {mep ? <> y el MEP a <strong className="font-numeric">{pesos(mep.venta)}</strong></> : null}.
            En Funes, Roldán y Rosario las casas y los lotes se publican y se pactan en dólares: la cotización define cuántos pesos hacen
            falta para la misma propiedad, no su precio.
          </p>
        )}
        {ipcUlt && (
          <p>
            La inflación de {mesDe(ipcUlt.fecha)} fue de <strong className="font-numeric">{porcentaje(ipcUlt.valor)}</strong>
            {ipc12 != null ? <> y acumula <strong className="font-numeric">{porcentaje(ipc12)}</strong> en los últimos doce meses</> : null} (INDEC, serie del BCRA).
            {dolar12 != null && ipc12 != null ? (
              <>
                {' '}En ese mismo período el dólar oficial se movió <strong className="font-numeric">{dolar12 >= 0 ? '+' : ''}{porcentaje(dolar12)}</strong>:
                {ipc12 > dolar12
                  ? ' los precios en pesos subieron más que el dólar, así que una propiedad en dólares quedó más barata medida en sueldos y alquileres en pesos.'
                  : ' el dólar subió más que los precios en pesos, así que una propiedad en dólares quedó más cara medida en sueldos y alquileres en pesos.'}
              </>
            ) : null}
          </p>
        )}
        {iclUlt && (
          <p>
            El Índice para Contratos de Locación (ICL) del Banco Central está en <strong className="font-numeric">{iclUlt.valor.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</strong>
            {icl12 != null ? <>, un <strong className="font-numeric">{icl12 >= 0 ? '+' : ''}{porcentaje(icl12)}</strong> en doce meses: es lo que ajustó un alquiler firmado hace un año con actualización anual por ICL</> : null}.
            El ICL combina la inflación y la evolución de los salarios, por eso suele correr por debajo del IPC cuando los sueldos pierden contra los precios.
          </p>
        )}
      </div>
    </>
  )
}

export default async function ResumenIndicadores() {
  const g = await informesGuardados()
  return (
    <section className="bg-[#F5F5F7]" aria-labelledby="indicadores-lectura">
      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-14 space-y-8">
        <div className="space-y-6">
          <h2 id="indicadores-lectura" className="text-2xl font-bold tracking-tight text-gray-900">Qué dicen hoy los indicadores</h2>
          {g ? (
            <Lectura g={g} />
          ) : (
            <p className="text-[15px] leading-relaxed text-gray-700">
              Dólar oficial, blue y MEP, inflación mensual e interanual (IPC) e Índice para Contratos de Locación (ICL): los datos se
              actualizan solos cada semana. Si no los ves en esta página, volvé en unos minutos.
            </p>
          )}
        </div>

        <div className="space-y-5">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Cómo usar estos datos en Funes y Roldán</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2">
              <h3 className="text-base font-bold text-gray-900">Si alquilás o tenés un inquilino</h3>
              <p className="text-sm leading-relaxed text-gray-700">
                Desde el DNU 70/2023 el índice y la frecuencia de actualización se pactan libremente en cada contrato; los firmados bajo la
                ley 27.551 siguen ajustando por ICL. Con la{' '}
                <Link href="/recursos/ajuste-alquiler" className="font-semibold text-[#17613C] underline underline-offset-2">calculadora de ajuste de alquiler</Link>{' '}
                ves cuánto corresponde actualizar según el índice que figura en tu contrato, y con la{' '}
                <Link href="/recursos/calculadora-alquiler" className="font-semibold text-[#17613C] underline underline-offset-2">calculadora de costos iniciales</Link>{' '}
                cuánto hace falta para entrar a un alquiler.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2">
              <h3 className="text-base font-bold text-gray-900">Si vendés o querés saber cuánto vale tu casa</h3>
              <p className="text-sm leading-relaxed text-gray-700">
                El precio de una casa o un lote se arma con lo que hoy se pide y se cierra en su barrio, en dólares, no con la inflación.
                Podés{' '}
                <Link href="/tasar" className="font-semibold text-[#17613C] underline underline-offset-2">tasar tu propiedad por barrio</Link>{' '}
                con los avisos vigentes de la zona y leer el{' '}
                <Link href="/mercado-inmobiliario-funes" className="font-semibold text-[#17613C] underline underline-offset-2">informe del mercado de Funes</Link>, con precios por m² y
                tiempos de venta.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2">
              <h3 className="text-base font-bold text-gray-900">Si construís o comprás en pozo</h3>
              <p className="text-sm leading-relaxed text-gray-700">
                El costo de construir se mueve con los materiales y los salarios del sector, no con el dólar: cuando la inflación en pesos le gana
                al tipo de cambio, construir se encarece en dólares. Seguimos ese costo mes a mes en el{' '}
                <Link href="/recursos/costos-de-construccion" className="font-semibold text-[#17613C] underline underline-offset-2">índice de costos de construcción</Link>{' '}
                para el Gran Rosario.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Fuentes: Banco Central de la República Argentina (series de IPC, ICL y tipo de cambio oficial) e INDEC; cotizaciones del dólar del
            mercado. Los indicadores se renuevan automáticamente cada semana
            {g?.lastUpdate ? <>; última actualización: {fechaLarga(g.lastUpdate)}</> : null}.
          </p>
        </div>
      </div>
    </section>
  )
}
