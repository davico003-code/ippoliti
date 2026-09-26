import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, MessageCircle, Phone } from "lucide-react"
import { getProperties, getPropertyById, formatPrice, generatePropertySlug } from "@/lib/tokko"
import type { TokkoProperty } from "@/lib/tokko"
import {
  HAUSING_PROPERTY_IDS,
  ESTANDAR_HAUSING,
  armarCombinador,
  fichaDe,
  ordenBarrio,
  precioVentaUsd,
  type FichaHausing,
  type HausingBarrio,
} from "@/lib/hausing"
import HausingWhatsLink from "@/components/hausing/HausingWhatsLink"
import Combinador from "@/components/hausing/Combinador"
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd"

// "Colección Hausing" — oscuro premium con la paleta SI (verde profundo casi
// negro + blanco; #00754A en botones). Todo lo que se ve de cada casa sale de
// su ficha en HILO (lib/hausing.ts). Las animaciones son CSS puro y terminan
// visibles: la versión anterior escondía todo con JS y en prod quedaba negra.

export const metadata: Metadata = {
  title: "Hausing — Casas de autor en los barrios más exclusivos de Funes | SI INMOBILIARIA",
  description:
    "Colección de casas Hausing en Kentucky, Funes Hills Cadaqués, Vida y Don Mateo. Pileta propia, losa radiante y aberturas con DVH. Fichas técnicas y visitas privadas con SI INMOBILIARIA.",
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

interface Residencia {
  property: TokkoProperty
  ficha: FichaHausing
  numero: number
  slug: string
  titulo: string
}

export default async function HausingPage() {
  const [fetched, feed] = await Promise.all([
    Promise.all(HAUSING_PROPERTY_IDS.map(id => getPropertyById(id).catch(() => null))),
    getProperties({ limit: 1000 }).catch(() => null),
  ])
  const properties = fetched.filter(Boolean) as TokkoProperty[]

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

  const construidas = residencias.map(r => r.ficha.construida).filter((n): n is number => !!n)
  const promedio = construidas.length
    ? Math.round(construidas.reduce((a, b) => a + b, 0) / construidas.length / 10) * 10
    : null
  const precios = residencias.map(r => precioVentaUsd(r.property)).filter((n): n is number => !!n)
  const desde = precios.length ? Math.min(...precios) : null

  const combinador = armarCombinador(feed?.objects ?? [], residencias)
  const lotesTotales = combinador.barrios.reduce((a, b) => a + b.lotes.length, 0)
  const barriosConLotes = combinador.barrios.filter(b => b.lotes.length).length

  const n = residencias.length
  const palabra = PALABRAS[n] ?? String(n)

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

      {/* ───────────── HERO ───────────── */}
      <section className="hz-hero relative overflow-hidden">
        <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 px-4 pb-14 pt-16 sm:px-6 lg:min-h-[calc(100svh-80px)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
          {/* Video: fondo a sangre en celular, marco vertical en desktop */}
          <div className="absolute inset-0 lg:relative lg:inset-auto lg:order-2 lg:flex lg:justify-end">
            <div className="hz-hero-frame relative h-full w-full overflow-hidden lg:aspect-[3/4] lg:h-auto lg:w-[min(100%,56vh)] lg:rounded-[28px]">
              <video
                className="absolute inset-0 h-full w-full object-cover"
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
              <div className="absolute inset-0 bg-gradient-to-b from-[#07120C]/70 via-[#07120C]/55 to-[#07120C] lg:hidden" />
              <div className="absolute inset-0 hidden rounded-[28px] ring-1 ring-inset ring-white/10 lg:block" />
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-start pt-[12vh] lg:pt-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hausing-logo.svg"
              alt="Hausing"
              className="hz-rise h-7 w-auto brightness-0 invert sm:h-8"
            />
            <p className="hz-rise hz-eyebrow mt-10" style={{ "--d": "80ms" } as React.CSSProperties}>
              <span className="hz-eyebrow-line" /> Colección privada · Funes
            </p>
            <h1
              className="hz-rise mt-5 max-w-[620px] text-[40px] font-light leading-[1.05] tracking-[-0.02em] text-white [text-wrap:balance] sm:text-[56px] lg:text-[54px] xl:text-[66px]"
              style={{ "--d": "160ms" } as React.CSSProperties}
            >
              Casas <span className="font-semibold">de autor</span> en los barrios más exclusivos de Funes.
            </h1>
            <p
              className="hz-rise mt-6 max-w-[480px] text-[16px] leading-relaxed text-white/65 sm:text-[17px]"
              style={{ "--d": "240ms" } as React.CSSProperties}
            >
              {n > 0 ? `${palabra} residencias` : "Residencias"} construidas por Hausing en Kentucky, Cadaqués, Vida y
              Don Mateo. Cada una sobre su lote, con su propio diseño. Ninguna se repite.
            </p>
            <div
              className="hz-rise mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
              style={{ "--d": "320ms" } as React.CSSProperties}
            >
              <a href="#combinar" className="hz-btn hz-btn-light">
                Elegí tu barrio <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#coleccion" className="hz-btn hz-btn-ghost">
                Ver la colección
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── CIFRAS (en vivo) ───────────── */}
      {n > 0 && (
        <section className="border-y border-white/[0.08] bg-[#0A1811]">
          <dl className="mx-auto grid max-w-[1240px] grid-cols-2 px-4 sm:px-6 lg:grid-cols-4">
            {[
              [String(n), n === 1 ? "residencia disponible" : "residencias disponibles"],
              lotesTotales > 0
                ? [String(lotesTotales), "lotes para combinar"]
                : [String(combinador.barrios.length), "barrios para elegir"],
              ...(promedio ? [[`${nf(promedio)} m²`, "construidos en promedio"]] : []),
              ...(desde ? [[`USD ${nf(Math.round(desde / 1000))}K`, "valor desde"]] : []),
            ].map(([valor, label], i) => (
              <div
                key={label}
                className={`hz-stat py-8 lg:py-10 ${i % 2 === 1 ? "pl-5 sm:pl-8" : ""} ${i > 1 ? "border-t border-white/[0.08] lg:border-t-0" : ""} ${i > 0 ? "lg:pl-10" : ""}`}
              >
                <dd className="font-numeric text-[30px] font-light leading-none text-white sm:text-[40px]">{valor}</dd>
                <dt className="mt-3 text-[12px] uppercase tracking-[0.14em] text-white/45">{label}</dt>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* ───────────── COMBINADOR: BARRIO × CASA ───────────── */}
      {combinador.barrios.length > 0 && combinador.casas.length > 0 && (
        <section id="combinar" className="mx-auto max-w-[1240px] scroll-mt-20 px-4 py-20 sm:px-6 lg:py-28">
          <div className="hz-reveal grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="max-w-[680px]">
              <p className="hz-eyebrow">
                <span className="hz-eyebrow-line" /> Tu combinación
              </p>
              <h2 className="mt-5 text-[32px] font-light leading-[1.1] tracking-[-0.015em] text-white [text-wrap:balance] sm:text-[48px]">
                Elegí el barrio. <span className="font-semibold">Hausing pone la casa.</span>
              </h2>
            </div>
            <p className="text-[16px] leading-relaxed text-white/60">
              Cruzamos los {combinador.barrios.length} barrios cerrados de Funes que analizamos con los
              {lotesTotales > 0 ? ` ${lotesTotales} lotes que tenemos hoy en venta en ${barriosConLotes} de ellos` : ' lotes que tenemos en venta'} y
              con las casas de la colección. Elegí dónde querés vivir y mirá qué casa entra en tu lote.
            </p>
          </div>
          <div className="hz-reveal mt-10">
            <Combinador barrios={combinador.barrios} casas={combinador.casas} />
          </div>
        </section>
      )}

      {/* ───────────── LA COLECCIÓN ───────────── */}
      <section id="coleccion" className="scroll-mt-20 border-t border-white/[0.08] py-20 lg:py-28">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="hz-reveal max-w-[640px]">
            <p className="hz-eyebrow">
              <span className="hz-eyebrow-line" /> La colección
            </p>
            <h2 className="mt-5 text-[32px] font-light leading-[1.1] tracking-[-0.015em] text-white [text-wrap:balance] sm:text-[44px]">
              {n === 1 ? (
                <>Una casa. <span className="font-semibold">Única.</span></>
              ) : (
                <>
                  {palabra} casas. <span className="font-semibold">Ninguna igual.</span>
                </>
              )}
            </h2>
          </div>

          {n === 0 ? (
            <div className="mt-12 rounded-2xl p-8 text-white/70 ring-1 ring-white/10">
              Estamos actualizando la colección.{" "}
              <HausingWhatsLink mensaje="Hola! Quiero información sobre las casas Hausing." className="font-semibold text-white underline">
                Escribinos por WhatsApp
              </HausingWhatsLink>{" "}
              y te contamos qué hay disponible.
            </div>
          ) : (
            <div className="mt-14 flex flex-col gap-20 lg:gap-28">
              {residencias.map((r, i) => (
                <ResidenciaCard
                  key={r.property.id}
                  r={r}
                  invertida={i % 2 === 1}
                  anclaBarrio={
                    r.ficha.barrio && residencias.findIndex(x => x.ficha.barrio?.key === r.ficha.barrio?.key) === i
                      ? r.ficha.barrio.key
                      : null
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ───────────── EL ESTÁNDAR HAUSING ───────────── */}
      <section className="bg-[#1A5C38]">
        <div className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 lg:py-24">
          <div className="hz-reveal grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="hz-eyebrow !text-white/70">
                <span className="hz-eyebrow-line !bg-white/50" /> El estándar Hausing
              </p>
              <h2 className="mt-5 text-[32px] font-light leading-[1.1] tracking-[-0.015em] text-white [text-wrap:balance] sm:text-[40px]">
                Cambian el barrio, el lote y el diseño. <span className="font-semibold">Esto no cambia.</span>
              </h2>
              <p className="mt-5 max-w-[420px] text-[16px] leading-relaxed text-white/70">
                Lo que tienen todas las casas de la colección, sin excepción.
              </p>
            </div>
            <ul className="grid gap-px overflow-hidden rounded-2xl bg-white/15 sm:grid-cols-2">
              {ESTANDAR_HAUSING.map((e, i) => (
                <li key={e.titulo} className="bg-[#1A5C38] p-6">
                  <span className="font-numeric text-[12px] tracking-[0.12em] text-white/50">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-2 text-[17px] font-semibold text-white">{e.titulo}</p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-white/70">{e.detalle}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────────── VISITA PRIVADA ───────────── */}
      <section className="hz-cierre relative overflow-hidden">
        <div className="hz-reveal relative mx-auto max-w-[760px] px-4 py-24 text-center sm:px-6 lg:py-32">
          <p className="hz-eyebrow justify-center">
            <span className="hz-eyebrow-line" /> Visita privada <span className="hz-eyebrow-line" />
          </p>
          <h2 className="mt-6 text-[36px] font-light leading-[1.05] tracking-[-0.02em] text-white [text-wrap:balance] sm:text-[56px]">
            Conocé tu próxima casa <span className="font-semibold">en persona.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[520px] text-[16px] leading-relaxed text-white/60 sm:text-[17px]">
            Coordinamos la visita en el horario que te quede cómodo, con un asesor de SI INMOBILIARIA que conoce cada
            casa y cada barrio.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <HausingWhatsLink
              mensaje="Hola! Quiero coordinar una visita privada a las casas Hausing."
              className="hz-btn hz-btn-green"
            >
              <MessageCircle className="h-4 w-4" /> Coordinar por WhatsApp
            </HausingWhatsLink>
            <a href="tel:+5493413340916" className="hz-btn hz-btn-ghost">
              <Phone className="h-4 w-4" /> <span className="font-numeric">341 334-0916</span>
            </a>
          </div>
        </div>
        <div className="relative border-t border-white/[0.08]">
          <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-3 px-4 py-6 text-[13px] text-white/45 sm:flex-row sm:px-6">
            <span>Hausing construye · SI INMOBILIARIA comercializa</span>
            <Link href="/propiedades" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
              Ver todas las propiedades <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function ResidenciaCard({
  r,
  invertida,
  anclaBarrio,
}: {
  r: Residencia
  invertida: boolean
  anclaBarrio: HausingBarrio["key"] | null
}) {
  const { ficha, property, numero, slug, titulo } = r
  const [principal, ...resto] = ficha.fotos
  const miniaturas = resto.slice(0, 2)
  const precio = formatPrice(property)
  const barrio = ficha.barrio

  const specs: [string, string][] = [
    ...(ficha.lote
      ? [["Lote", `${nf(ficha.lote)} m²${ficha.loteMedidas ? ` · ${ficha.loteMedidas}` : ""}`] as [string, string]]
      : []),
    ...(ficha.cubierta ? [["Cubierta", `${nf(ficha.cubierta)} m²`] as [string, string]] : []),
    ...(ficha.construida ? [["Total construida", `${nf(ficha.construida)} m²`] as [string, string]] : []),
    ...(ficha.dormitorios ? [["Dormitorios", String(ficha.dormitorios)] as [string, string]] : []),
    ...(ficha.banos ? [["Baños", String(ficha.banos)] as [string, string]] : []),
    ...(ficha.plantas ? [["Plantas", String(ficha.plantas)] as [string, string]] : []),
    ...(ficha.orientacion ? [["Orientación", ficha.orientacion] as [string, string]] : []),
    ...(ficha.piscina ? [["Pileta", ficha.piscina] as [string, string]] : []),
  ]

  const estadoColor =
    ficha.estado?.tipo === "inmediata" ? "#34C77B" : ficha.estado?.tipo === "obra" ? "#fbce07" : "#FFFFFF"

  return (
    <article
      id={anclaBarrio ? `barrio-${anclaBarrio}` : `residencia-${property.id}`}
      className="hz-reveal grid scroll-mt-24 items-center gap-8 lg:grid-cols-12 lg:gap-14"
    >
      {/* Fotos */}
      <div className={`lg:col-span-7 ${invertida ? "lg:order-2" : ""}`}>
        <Link href={`/propiedades/${slug}`} className="group block">
          <div className="relative aspect-[16/11] overflow-hidden rounded-2xl bg-[#0C1C14]">
            {principal && (
              <Image
                src={principal}
                alt={titulo}
                fill
                sizes="(max-width:1024px) 100vw, 58vw"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
              />
            )}
            <span className="absolute left-4 top-4 rounded-full bg-[#07120C]/70 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-white backdrop-blur-md">
              HAUSING
            </span>
          </div>
        </Link>
        {miniaturas.length === 2 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {miniaturas.map(src => (
              <div key={src} className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#0C1C14]">
                <Image src={src} alt="" fill sizes="(max-width:1024px) 50vw, 29vw" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ficha */}
      <div className={`lg:col-span-5 ${invertida ? "lg:order-1" : ""}`}>
        <div className="flex items-center justify-between gap-4">
          <span className="font-numeric text-[15px] font-light tracking-[0.12em] text-[#8FD1AE]">
            N° {String(numero).padStart(2, "0")}
          </span>
          {ficha.estado && (
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium text-white/85 ring-1 ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: estadoColor }} />
              {ficha.estado.label}
            </span>
          )}
        </div>

        {barrio && (
          <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/50">{barrio.nombre}</p>
        )}
        <h3 className="mt-2 text-[34px] font-light leading-[1.05] tracking-[-0.015em] text-white [text-wrap:balance] sm:text-[40px]">
          {ficha.identificador || titulo}
        </h3>

        {specs.length > 0 && (
          <dl className="mt-7 grid grid-cols-2 border-t border-white/[0.09]">
            {specs.map(([k, v], i) => (
              <div
                key={k}
                className={`border-b border-white/[0.09] py-3.5 ${i % 2 === 1 ? "pl-4" : "pr-4"}`}
              >
                <dt className="text-[11px] uppercase tracking-[0.12em] text-white/40">{k}</dt>
                <dd className="font-numeric mt-1 text-[15px] text-white">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {barrio && (
          <div className="mt-6 rounded-xl bg-white/[0.035] p-4 ring-1 ring-white/[0.07]">
            <p className="text-[13px] leading-relaxed text-white/65">
              <span className="font-semibold text-white">El barrio.</span> {barrio.frase}
            </p>
            <Link
              href={barrio.href}
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-[#8FD1AE] transition-colors hover:text-white"
            >
              Conocé {barrio.nombre} <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/40">Valor</p>
            <p className="font-numeric mt-1 text-[28px] font-light leading-none text-white">{precio}</p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <HausingWhatsLink
              mensaje={`Hola! Me interesa la casa Hausing ${ficha.identificador ? `${ficha.identificador} ` : ""}${barrio ? `en ${barrio.nombre}` : ""}. ¿Podemos coordinar una visita?`}
              propertyId={property.id}
              titulo={titulo}
              className="hz-icon-btn shrink-0"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
              <span className="sr-only">Consultar por WhatsApp</span>
            </HausingWhatsLink>
            <Link href={`/propiedades/${slug}`} className="hz-btn hz-btn-light flex-1 !py-3 sm:flex-none">
              Ver la casa <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

const CSS = `
.hz { background:#07120C; color:#fff; overflow-x:clip; }
.hz-hero { background:
  radial-gradient(60% 55% at 78% 40%, rgba(26,92,56,.38) 0%, rgba(7,18,12,0) 70%),
  radial-gradient(40% 40% at 10% 100%, rgba(0,117,74,.14) 0%, rgba(7,18,12,0) 70%),
  #07120C; }
.hz-cierre { background:
  radial-gradient(50% 60% at 50% 0%, rgba(26,92,56,.35) 0%, rgba(7,18,12,0) 70%),
  #07120C; }
.hz-hero-frame { box-shadow: 0 40px 120px -30px rgba(0,0,0,.8); }
.hz-eyebrow { display:flex; align-items:center; gap:12px; font-size:12px; font-weight:600;
  letter-spacing:.2em; text-transform:uppercase; color:#8FD1AE; }
.hz-eyebrow-line { display:inline-block; width:28px; height:1px; background:#8FD1AE; opacity:.7; }
.hz-btn { display:inline-flex; align-items:center; justify-content:center; gap:10px;
  padding:15px 26px; border-radius:999px; font-size:15px; font-weight:600;
  transition: background-color .25s ease, color .25s ease, border-color .25s ease, transform .25s ease; }
.hz-btn:active { transform: scale(.98); }
.hz-btn-light { background:#fff; color:#07120C; }
.hz-btn-light:hover { background:#E6F2EB; }
.hz-btn-green { background:#00754A; color:#fff; }
.hz-btn-green:hover { background:#1A5C38; }
.hz-btn-ghost { color:#fff; border:1px solid rgba(255,255,255,.22); background:rgba(255,255,255,.04); }
.hz-btn-ghost:hover { border-color:rgba(255,255,255,.5); background:rgba(255,255,255,.08); }
.hz-icon-btn { display:inline-flex; align-items:center; justify-content:center; width:46px; height:46px;
  border-radius:999px; color:#fff; border:1px solid rgba(255,255,255,.22); transition:border-color .25s ease, background-color .25s ease; }
.hz-icon-btn:hover { border-color:rgba(255,255,255,.5); background:rgba(255,255,255,.08); }
@keyframes hzFade { from { opacity:0; } to { opacity:1; } }
.hz-fade { animation: hzFade .6s ease both; }
@keyframes hzRise { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:none; } }
@media (prefers-reduced-motion: no-preference) {
  .hz-rise { animation: hzRise .9s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--d, 0ms); }
  @supports (animation-timeline: view()) {
    .hz-reveal { animation: hzRise linear both; animation-timeline: view(); animation-range: entry 0% entry 35%; }
  }
}
`
