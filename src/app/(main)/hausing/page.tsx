import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, MessageCircle, Phone } from "lucide-react"
import { getPropertyById, formatPrice, generatePropertySlug } from "@/lib/tokko"
import type { TokkoProperty } from "@/lib/tokko"
import {
  HAUSING_PROPERTY_IDS,
  ESTANDAR_HAUSING,
  fichaBarrio,
  fichaDe,
  ordenBarrio,
  precioVentaUsd,
  type DatoBarrio,
  type FichaBarrio,
  type FichaHausing,
  type HausingBarrio,
} from "@/lib/hausing"
import HausingWhatsLink from "@/components/hausing/HausingWhatsLink"
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd"

// "Colección Hausing" — editorial de lujo: negro puro + blanco, verde SI profundo
// (#1A5C38) solo como detalle (líneas finas, números del estándar), fichas de
// barrio en grafito, fotos a sangre y
// tipografía Raleway muy fina a gran escala (números en Poppins).
// Todo lo que se ve de cada casa sale de su ficha en HILO y los datos de cada
// barrio de nuestra base (lib/hausing.ts). Animaciones CSS puras que terminan
// visibles: la versión anterior escondía todo con JS y en prod quedaba negra.

export const metadata: Metadata = {
  title: "Hausing — Casas de autor en los barrios más exclusivos de Funes | SI INMOBILIARIA",
  description:
    "Colección de casas Hausing en Kentucky, Funes Hills Cadaqués, Vida y Don Mateo. Pileta propia, losa radiante y aberturas con DVH. Fichas técnicas, datos de cada barrio y visitas privadas con SI INMOBILIARIA.",
  alternates: { canonical: "https://siinmobiliaria.com/hausing" },
  openGraph: {
    title: "Colección Hausing — Casas de autor en Funes",
    description: "Residencias Hausing en los barrios más exclusivos de Funes. Presentadas por SI INMOBILIARIA.",
    url: "https://siinmobiliaria.com/hausing",
    images: ["/og-image.jpg"],
  },
}

export const revalidate = 21600

const PALABRAS = ["Cero", "Una", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve", "Diez"]
const nf = (n: number) => n.toLocaleString("es-AR")
const dos = (n: number) => String(n).padStart(2, "0")

interface Residencia {
  property: TokkoProperty
  ficha: FichaHausing
  numero: number
  slug: string
  titulo: string
}

export default async function HausingPage() {
  const properties = (
    await Promise.all(HAUSING_PROPERTY_IDS.map(id => getPropertyById(id).catch(() => null)))
  ).filter(Boolean) as TokkoProperty[]

  // Orden: jerarquía del barrio y, dentro del barrio, precio de mayor a menor.
  const residencias: Residencia[] = properties
    .map(property => ({ property, ficha: fichaDe(property) }))
    .sort(
      (a, b) =>
        ordenBarrio(a.ficha.barrio) - ordenBarrio(b.ficha.barrio) ||
        (precioVentaUsd(b.property) ?? 0) - (precioVentaUsd(a.property) ?? 0),
    )
    .map((r, i) => ({
      ...r,
      numero: i + 1,
      slug: generatePropertySlug(r.property),
      titulo: r.property.publication_title || r.property.address,
    }))

  const construidas = residencias.map(r => r.ficha.construida).filter((x): x is number => !!x)
  const promedio = construidas.length
    ? Math.round(construidas.reduce((a, b) => a + b, 0) / construidas.length / 10) * 10
    : null
  const precios = residencias.map(r => precioVentaUsd(r.property)).filter((x): x is number => !!x)
  const desde = precios.length ? Math.min(...precios) : null
  const barrios = Array.from(
    new Map(residencias.filter(r => r.ficha.barrio).map(r => [r.ficha.barrio!.key, r.ficha.barrio!])).values(),
  )

  const n = residencias.length
  const palabra = PALABRAS[n] ?? String(n)
  // Portada y cierre usan la 2ª foto de las dos primeras casas (exteriores con
  // pileta); las fichas muestran la 1ª y la 3ª/4ª, así no se repite ninguna.
  const portada = residencias[0]?.ficha.fotos[1] ?? residencias[0]?.ficha.fotos[0] ?? null
  const fotoCierre = residencias[1]?.ficha.fotos[1] ?? portada

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Colección Hausing — Casas en Funes",
    itemListElement: residencias.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://siinmobiliaria.com/propiedades/${r.slug}`,
      name: r.titulo,
    })),
  }

  const cifras: [string, string, string?][] = [
    [dos(n), n === 1 ? "Residencia" : "Residencias"],
    [dos(barrios.length), "Barrios"],
    ...(promedio ? [[nf(promedio), "m² construidos promedio"] as [string, string]] : []),
    ...(desde ? [[`${nf(Math.round(desde / 1000))}K`, "Desde USD"] as [string, string]] : []),
  ]

  return (
    <div className="hz">
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: "https://siinmobiliaria.com" },
          { name: "Hausing", url: "https://siinmobiliaria.com/hausing" },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ═════════════ HERO — foto a sangre (video en celular) ═════════════ */}
      <section className="relative isolate flex min-h-[calc(100svh-64px)] flex-col overflow-hidden bg-black lg:min-h-[calc(100svh-80px)]">
        {portada && (
          <Image
            src={portada}
            alt="Casa Hausing"
            fill
            priority
            sizes="100vw"
            className="hz-kenburns -z-20 hidden object-cover sm:block"
          />
        )}
        <video
          className="absolute inset-0 -z-20 h-full w-full object-cover sm:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hausing/hero-poster.jpg"
          aria-hidden="true"
        >
          <source src="/videos/proyectos/hausing.webm" type="video/webm" />
          <source src="/videos/proyectos/hausing.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/55 via-black/35 to-black" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />

        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-5 pb-8 pt-8 sm:px-10 lg:pt-12">
          <div className="hz-rise flex items-center justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/hausing-logo.svg" alt="Hausing" className="h-7 w-auto brightness-0 invert sm:h-8" />
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.3em] text-white/70 sm:block">
              Colección privada · Funes
            </span>
          </div>

          <div className="mt-auto pt-24">
            <p className="hz-rise hz-label text-white/70" style={{ "--d": "80ms" } as React.CSSProperties}>
              Hausing × SI INMOBILIARIA
            </p>
            <h1
              className="hz-rise mt-5 max-w-[1100px] text-[52px] font-extralight leading-[0.95] tracking-[-0.035em] text-white [text-wrap:balance] sm:text-[84px] lg:text-[124px]"
              style={{ "--d": "160ms" } as React.CSSProperties}
            >
              Casas <span className="font-semibold">de autor.</span>
            </h1>
            <p
              className="hz-rise mt-6 max-w-[560px] text-[17px] font-light leading-relaxed text-white/80 sm:text-[20px]"
              style={{ "--d": "240ms" } as React.CSSProperties}
            >
              {n > 0 ? `${palabra} residencias` : "Residencias"} en los barrios más exclusivos de Funes. Cada una sobre
              su lote, con su propio diseño. Ninguna se repite.
            </p>
            <div
              className="hz-rise mt-9 flex flex-col gap-3 sm:flex-row"
              style={{ "--d": "320ms" } as React.CSSProperties}
            >
              <a href="#coleccion" className="hz-btn hz-btn-light">
                Ver la colección <ArrowRight className="h-4 w-4" />
              </a>
              <HausingWhatsLink
                mensaje="Hola! Quiero coordinar una visita privada a las casas Hausing."
                className="hz-btn hz-btn-glass"
              >
                Coordinar visita privada
              </HausingWhatsLink>
            </div>
          </div>

          {n > 0 && (
            <dl
              className="hz-rise mt-12 grid grid-cols-2 border-t border-white/20 sm:grid-cols-4"
              style={{ "--d": "420ms" } as React.CSSProperties}
            >
              {cifras.map(([valor, label], i) => (
                <div
                  key={label}
                  className={`pt-5 ${i % 2 === 1 ? "pl-5" : ""} ${i > 1 ? "mt-5 sm:mt-0" : ""} sm:pl-0 ${i > 0 ? "sm:border-l sm:border-white/20 sm:pl-6" : ""}`}
                >
                  <dd className="font-numeric text-[30px] font-extralight leading-none text-white sm:text-[40px]">
                    {valor}
                  </dd>
                  <dt className="hz-label mt-2.5 text-white/60">{label}</dt>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* ═════════════ MANIFIESTO ═════════════ */}
      <section className="bg-black px-5 py-24 sm:px-10 lg:py-36">
        <div className="hz-reveal mx-auto max-w-[1100px] text-center">
          <p className="hz-label text-white/45">La colección</p>
          <p className="mt-8 text-[30px] font-extralight leading-[1.2] tracking-[-0.02em] text-white [text-wrap:balance] sm:text-[46px] lg:text-[58px]">
            {palabra} casas.{" "}
            {barrios.length > 1 && (
              <>
                {PALABRAS[barrios.length] ?? barrios.length} barrios.{" "}
              </>
            )}
            <span className="font-semibold">Ninguna igual.</span>{" "}
            <span className="text-white/45">
              Cada una con su ficha técnica y la de su barrio: los datos que manejamos para que decidas con todo sobre
              la mesa.
            </span>
          </p>
          {barrios.length > 0 && (
            <ul className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3">
              {barrios.map(b => (
                <li key={b.key}>
                  <a
                    href={`#barrio-${b.key}`}
                    className="hz-label text-white/70 underline-offset-8 transition-colors hover:text-white hover:underline"
                  >
                    {b.nombre}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ═════════════ RESIDENCIAS ═════════════ */}
      <section id="coleccion" className="scroll-mt-16 bg-black">
        {n === 0 ? (
          <div className="mx-auto max-w-[1440px] px-5 pb-24 text-white/70 sm:px-10">
            Estamos actualizando la colección.{" "}
            <HausingWhatsLink
              mensaje="Hola! Quiero información sobre las casas Hausing."
              className="font-semibold text-white underline"
            >
              Escribinos por WhatsApp
            </HausingWhatsLink>{" "}
            y te contamos qué hay disponible.
          </div>
        ) : (
          residencias.map((r, i) => (
            <ResidenciaCard
              key={r.property.id}
              r={r}
              total={n}
              anclaBarrio={
                r.ficha.barrio && residencias.findIndex(x => x.ficha.barrio?.key === r.ficha.barrio?.key) === i
                  ? r.ficha.barrio.key
                  : null
              }
            />
          ))
        )}
      </section>

      {/* ═════════════ EL ESTÁNDAR HAUSING — blanco ═════════════ */}
      <section className="bg-white px-5 py-24 text-[#0A0A0A] sm:px-10 lg:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="hz-reveal grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div>
              <p className="hz-label text-[#1A5C38]">El estándar Hausing</p>
              <h2 className="mt-6 text-[40px] font-extralight leading-[1] tracking-[-0.03em] [text-wrap:balance] sm:text-[64px] lg:text-[80px]">
                Esto <span className="font-semibold">no cambia.</span>
              </h2>
            </div>
            <p className="max-w-[460px] text-[17px] font-light leading-relaxed text-black/60 lg:justify-self-end">
              Cambian el barrio, el lote y el diseño. Lo que sigue lo tienen todas las casas de la colección, sin
              excepción.
            </p>
          </div>
          <ul className="hz-reveal mt-16 grid border-t border-black/10 sm:grid-cols-2 lg:grid-cols-3">
            {ESTANDAR_HAUSING.map((e, i) => (
              <li
                key={e.titulo}
                className="border-b border-black/10 py-8 sm:odd:pr-8 sm:even:pl-8 lg:px-8 lg:[&:nth-child(3n+1)]:pl-0 lg:[&:nth-child(3n)]:pr-0 lg:[&:not(:nth-child(3n+1))]:border-l"
              >
                <span className="font-numeric text-[44px] font-extralight leading-none text-black/25">{dos(i + 1)}</span>
                <p className="mt-5 text-[19px] font-semibold">{e.titulo}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-black/55">{e.detalle}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═════════════ VISITA PRIVADA — foto a sangre ═════════════ */}
      <section className="relative isolate overflow-hidden bg-black">
        {fotoCierre && (
          <Image src={fotoCierre} alt="" fill sizes="100vw" className="-z-20 object-cover" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/55 to-black/85" />
        <div className="hz-reveal mx-auto flex min-h-[80vh] max-w-[1100px] flex-col items-center justify-center px-5 py-28 text-center sm:px-10">
          <p className="hz-label text-white/70">Visita privada</p>
          <h2 className="mt-6 text-[44px] font-extralight leading-[1] tracking-[-0.03em] text-white [text-wrap:balance] sm:text-[72px] lg:text-[96px]">
            Conocela <span className="font-semibold">en persona.</span>
          </h2>
          <p className="mt-7 max-w-[540px] text-[17px] font-light leading-relaxed text-white/75 sm:text-[19px]">
            Coordinamos la visita en el horario que te quede cómodo, con un asesor de SI INMOBILIARIA que conoce cada
            casa y cada barrio.
          </p>
          <div className="mt-10 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <HausingWhatsLink
              mensaje="Hola! Quiero coordinar una visita privada a las casas Hausing."
              className="hz-btn hz-btn-light"
            >
              <MessageCircle className="h-4 w-4" /> Coordinar por WhatsApp
            </HausingWhatsLink>
            <a href="tel:+5493413340916" className="hz-btn hz-btn-glass">
              <Phone className="h-4 w-4" /> <span className="font-numeric">341 334-0916</span>
            </a>
          </div>
        </div>
        <div className="border-t border-white/15">
          <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-5 py-6 text-[12px] uppercase tracking-[0.2em] text-white/50 sm:flex-row sm:px-10">
            <span>Hausing construye · SI INMOBILIARIA comercializa</span>
            <Link href="/propiedades" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
              Todas las propiedades <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function ResidenciaCard({
  r,
  total,
  anclaBarrio,
}: {
  r: Residencia
  total: number
  anclaBarrio: HausingBarrio["key"] | null
}) {
  const { ficha, property, numero, slug, titulo } = r
  const principal = ficha.fotos[0]
  const interiores = ficha.fotos.slice(2, 4)
  const precio = formatPrice(property)
  const barrio = ficha.barrio
  const fichaB = barrio ? fichaBarrio(barrio) : null

  const specs: [string, string][] = [
    ...(ficha.lote
      ? [["Lote", `${nf(ficha.lote)} m²${ficha.loteMedidas ? ` · ${ficha.loteMedidas}` : ""}`] as [string, string]]
      : []),
    ...(ficha.cubierta ? [["Superficie cubierta", `${nf(ficha.cubierta)} m²`] as [string, string]] : []),
    ...(ficha.construida ? [["Total construida", `${nf(Math.round(ficha.construida))} m²`] as [string, string]] : []),
    ...(ficha.dormitorios ? [["Dormitorios", String(ficha.dormitorios)] as [string, string]] : []),
    ...(ficha.banos ? [["Baños", String(ficha.banos)] as [string, string]] : []),
    ...(ficha.plantas ? [["Plantas", String(ficha.plantas)] as [string, string]] : []),
    ...(ficha.orientacion ? [["Orientación", ficha.orientacion] as [string, string]] : []),
    ...(ficha.piscina ? [["Pileta", ficha.piscina] as [string, string]] : []),
  ]

  const estadoColor = ficha.estado?.tipo === "inmediata" ? "#00754A" : ficha.estado?.tipo === "obra" ? "#fbce07" : "#FFFFFF"

  return (
    <article id={anclaBarrio ? `barrio-${anclaBarrio}` : `residencia-${property.id}`} className="scroll-mt-16">
      {/* Foto a sangre + número gigante */}
      <Link href={`/propiedades/${slug}`} className="group relative block h-[72svh] min-h-[440px] overflow-hidden lg:h-[88svh]">
        {principal && (
          <Image
            src={principal}
            alt={titulo}
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/10" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 pb-10 sm:px-10 lg:flex-row lg:items-end lg:justify-between lg:pb-14">
            <div className="flex items-end gap-5 sm:gap-8">
              <span className="font-numeric text-[96px] font-extralight leading-[0.8] tracking-[-0.05em] text-white sm:text-[150px] lg:text-[200px]">
                {dos(numero)}
              </span>
              <div className="pb-1 sm:pb-3">
                {barrio && <p className="hz-label text-white/75">{barrio.nombre}</p>}
                <h3 className="mt-2 text-[34px] font-light leading-none tracking-[-0.02em] text-white sm:text-[48px]">
                  {ficha.identificador || titulo}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-4 lg:pb-3">
              {ficha.estado && (
                <span className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3.5 py-2 text-[12px] font-medium text-white ring-1 ring-white/25 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: estadoColor }} />
                  {ficha.estado.label}
                </span>
              )}
              <span className="font-numeric text-[12px] tracking-[0.2em] text-white/50">
                {dos(numero)} / {dos(total)}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Ficha técnica + interiores */}
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 sm:px-10 lg:grid-cols-12 lg:gap-16 lg:py-24">
        <div className="hz-reveal lg:col-span-5">
          <p className="hz-label text-white/45">Ficha técnica</p>
          {specs.length > 0 && (
            <dl className="mt-6 border-t border-white/15">
              {specs.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-6 border-b border-white/15 py-4">
                  <dt className="text-[14px] text-white/55">{k}</dt>
                  <dd className="font-numeric text-right text-[16px] text-white">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="mt-10">
            <p className="hz-label text-white/45">Valor</p>
            <p className="font-numeric mt-3 text-[40px] font-extralight leading-none tracking-[-0.02em] text-white sm:text-[52px]">
              {precio}
            </p>
          </div>
          <div className="mt-8 flex gap-3">
            <Link href={`/propiedades/${slug}`} className="hz-btn hz-btn-light flex-1 sm:flex-none">
              Ver la casa <ArrowRight className="h-4 w-4" />
            </Link>
            <HausingWhatsLink
              mensaje={`Hola! Me interesa la casa Hausing ${ficha.identificador ? `${ficha.identificador} ` : ""}${barrio ? `en ${barrio.nombre}` : ""}. ¿Podemos coordinar una visita?`}
              propertyId={property.id}
              titulo={titulo}
              className="hz-btn hz-btn-glass !px-5"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
              <span className="sm:hidden">Consultar</span>
              <span className="hidden sm:inline">Consultar por WhatsApp</span>
            </HausingWhatsLink>
          </div>
        </div>

        {interiores.length > 0 && (
          <div className="hz-reveal grid grid-cols-2 gap-3 lg:col-span-7 lg:gap-4">
            {interiores.map(src => (
              <div
                key={src}
                className={`relative overflow-hidden bg-white/5 ${interiores.length === 1 ? "col-span-2 aspect-[16/10]" : "aspect-[3/4]"}`}
              >
                <Image src={src} alt="" fill sizes="(max-width:1024px) 50vw, 30vw" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {barrio && fichaB &&
        (anclaBarrio ? (
          <BarrioCompleto barrio={barrio} f={fichaB} />
        ) : (
          <BarrioCompacto
            barrio={barrio}
            f={fichaB}
            foto={fichaB.fotos[(numero - 1) % Math.max(fichaB.fotos.length, 1)]}
          />
        ))}
    </article>
  )
}

// Valores largos ("800–1.400 m²") van en cuerpo más chico para no cortarse en la grilla 2×2.
function largo(d: DatoBarrio): boolean {
  return d.valor.length + (d.unidad?.length ?? 0) > 8
}

// Dos oraciones de la mirada del broker: el párrafo completo vive en la guía del barrio.
function resumen(txt: string): string {
  return txt.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")
}

// Vista satelital real del barrio (Esri World Imagery, la misma del mapa de
// /propiedades) para los barrios sin fotos propias. Mosaico de 5×5 tiles
// centrado en las coordenadas del tasador.
function Satelite({ lat, lon, z = 16 }: { lat: number; lon: number; z?: number }) {
  const n = 2 ** z
  const xt = ((lon + 180) / 360) * n
  const r = (lat * Math.PI) / 180
  const yt = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n
  const x0 = Math.floor(xt) - 2
  const y0 = Math.floor(yt) - 2
  const tiles: { x: number; y: number }[] = []
  for (let dy = 0; dy < 5; dy++) for (let dx = 0; dx < 5; dx++) tiles.push({ x: x0 + dx, y: y0 + dy })
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute grid grid-cols-5"
        style={{ width: 1280, left: `calc(50% - ${(xt - x0) * 256}px)`, top: `calc(50% - ${(yt - y0) * 256}px)` }}
      >
        {tiles.map(t => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${t.x}-${t.y}`}
            src={`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${t.y}/${t.x}`}
            alt=""
            width={256}
            height={256}
            loading="lazy"
            className="block h-[256px] w-[256px]"
          />
        ))}
      </div>
      <span className="absolute bottom-2 right-3 text-[9px] text-white/50">Imagen satelital: Esri</span>
    </div>
  )
}

// Ficha del barrio completa (primera casa de cada barrio): bloque verde SI a sangre.
function BarrioCompleto({ barrio, f }: { barrio: HausingBarrio; f: FichaBarrio }) {
  const [principal, ...extras] = f.fotos
  const datos = f.datos
  return (
    <div className="border-t border-white/10 bg-[#111111]">
      <div className="grid lg:grid-cols-2">
        {/* Foto del barrio */}
        <div className="relative min-h-[360px] overflow-hidden bg-[#0A0A0A] lg:min-h-[760px]">
          {principal ? (
            <Image src={principal} alt={`${barrio.nombre}, Funes`} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          ) : (
            f.coordenadas && <Satelite lat={f.coordenadas.lat} lon={f.coordenadas.lon} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          {extras.length > 0 && (
            <div className="absolute right-5 top-5 hidden gap-2 sm:flex">
              {extras.slice(0, 2).map(src => (
                <div key={src} className="relative h-20 w-28 overflow-hidden ring-1 ring-white/40">
                  <Image src={src} alt="" fill sizes="112px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <p className="hz-label flex items-center gap-3 text-white/85"><span className="hz-acento" />El barrio de esta casa</p>
            <h4 className="mt-3 text-[40px] font-light leading-none tracking-[-0.02em] text-white sm:text-[56px]">
              {barrio.nombre}
            </h4>
            <p className="mt-3 text-[14px] text-white/75">{f.tier} · Funes</p>
          </div>
        </div>

        {/* Datos duros */}
        <div className="hz-reveal px-5 py-12 text-white sm:px-10 lg:px-14 lg:py-16">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="hz-label flex items-center gap-3 text-white/70"><span className="hz-acento" />Ficha del barrio</p>
            <p className="text-[11px] text-white/55">Datos relevados por SI INMOBILIARIA</p>
          </div>

          {datos.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-white/15 pt-8">
              {datos.map(d => (
                <div key={d.label}>
                  <dd
                    className={`font-numeric whitespace-nowrap font-extralight leading-none tracking-[-0.02em] ${largo(d) ? "text-[24px] sm:text-[30px]" : "text-[30px] sm:text-[42px]"}`}
                  >
                    {d.valor}
                    {d.unidad && <span className="ml-1 text-[15px] font-light text-white/60">{d.unidad}</span>}
                  </dd>
                  <dt className="hz-label mt-3 text-white/60">{d.label}</dt>
                </div>
              ))}
            </dl>
          )}

          {f.amenities.length > 0 && (
            <div className="mt-10 border-t border-white/15 pt-8">
              <p className="hz-label text-white/60">Amenities</p>
              <p className="mt-4 text-[16px] font-light leading-[1.9] text-white/90">
                {f.amenities.join("  ·  ")}
              </p>
            </div>
          )}

          {f.infraestructura.length > 0 && (
            <div className="mt-8 border-t border-white/15 pt-8">
              <p className="hz-label text-white/60">Infraestructura y seguridad</p>
              <p className="mt-4 text-[16px] font-light leading-[1.9] text-white/90">
                {f.infraestructura.join("  ·  ")}
              </p>
            </div>
          )}

          {f.mirada && (
            <figure className="mt-10 border-t border-white/15 pt-8">
              <p className="text-[19px] font-light italic leading-relaxed text-white [text-wrap:pretty] sm:text-[21px]">
                “{resumen(f.mirada)}”
              </p>
              <figcaption className="hz-label mt-4 text-white/60">La mirada del broker</figcaption>
            </figure>
          )}

          <Link
            href={barrio.href}
            className="mt-10 inline-flex items-center gap-2 border-b border-white/50 pb-1 text-[14px] font-semibold text-white transition-colors hover:border-white"
          >
            Guía completa de {barrio.nombre} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// Segunda/tercera casa del mismo barrio: franja verde con otra foto y los datos clave.
function BarrioCompacto({ barrio, f, foto }: { barrio: HausingBarrio; f: FichaBarrio; foto?: string }) {
  const datos = f.datos.slice(0, 4)
  return (
    <div className="border-t border-white/10 bg-[#111111]">
      <div className="mx-auto flex max-w-[1440px] flex-col sm:flex-row">
        {foto && (
          <div className="relative h-48 shrink-0 sm:h-auto sm:w-[34%]">
            <Image src={foto} alt={`${barrio.nombre}, Funes`} fill sizes="(max-width:640px) 100vw, 34vw" className="object-cover" />
          </div>
        )}
        <div className="flex flex-1 flex-col justify-center gap-7 px-5 py-10 text-white sm:px-10">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-[22px] font-light">
              <span className="hz-label mr-3 inline-flex items-center gap-3 text-white/60"><span className="hz-acento" />El barrio</span>
              {barrio.nombre}
            </p>
            <a href={`#barrio-${barrio.key}`} className="hz-label text-white/70 transition-colors hover:text-white">
              Ficha completa ↑
            </a>
          </div>
          <dl className="grid grid-cols-2 gap-6 border-t border-white/15 pt-6 sm:grid-cols-4">
            {datos.map(d => (
              <div key={d.label}>
                <dd className="font-numeric whitespace-nowrap text-[24px] font-extralight leading-none">
                  {d.valor}
                  {d.unidad && <span className="ml-1 text-[13px] text-white/60">{d.unidad}</span>}
                </dd>
                <dt className="hz-label mt-2.5 text-white/60">{d.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

const CSS = `
.hz { background:#000; color:#fff; overflow-x:clip; }
.hz-label { font-size:11px; font-weight:600; letter-spacing:.24em; text-transform:uppercase; }
.hz-btn { display:inline-flex; align-items:center; justify-content:center; gap:10px;
  padding:16px 28px; font-size:14px; font-weight:600; letter-spacing:.04em;
  transition: background-color .3s ease, color .3s ease, border-color .3s ease; }
.hz-btn-light { background:#fff; color:#000; }
.hz-btn-light:hover { background:#E8E8E8; color:#000; }
.hz-acento { display:inline-block; width:28px; height:2px; background:#00754A; }
.hz-btn-glass { color:#fff; border:1px solid rgba(255,255,255,.4); background:rgba(0,0,0,.25);
  -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
.hz-btn-glass:hover { background:#fff; color:#000; border-color:#fff; }
@keyframes hzRise { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
@keyframes hzKen { from { transform:scale(1.12); } to { transform:scale(1); } }
@media (prefers-reduced-motion: no-preference) {
  .hz-rise { animation: hzRise 1.1s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--d, 0ms); }
  .hz-kenburns { animation: hzKen 14s cubic-bezier(.2,.6,.3,1) both; }
  @supports (animation-timeline: view()) {
    .hz-reveal { animation: hzRise linear both; animation-timeline: view(); animation-range: entry 0% entry 30%; }
  }
}
`
