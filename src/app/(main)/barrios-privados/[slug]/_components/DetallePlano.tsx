"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, MessageCircle, FileText } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

// Plano del barrio (id=plano): card con preview + descarga PDF + WhatsApp,
// junto a una card destacada con una foto del barrio. Sin plano → la card de
// plano se reemplaza por un bloque de WhatsApp. Paleta blanco + verde.

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif";
const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif";

export default function DetallePlano({
  slug,
  nombre,
  planoUrl,
  previewUrl,
  destacada,
  destacadaTitular,
}: {
  slug: string;
  nombre: string;
  planoUrl: string | null;
  previewUrl: string | null;
  destacada?: string | null;
  destacadaTitular?: string;
}) {
  const waText = `Hola SI, ¿me pasan el plano de ${nombre}?`;
  const waUrl = `https://wa.me/5493412101694?text=${encodeURIComponent(waText)}`;

  return (
    <section id="plano" className="scroll-mt-28 bg-[#F5F8F5] py-16 md:scroll-mt-32 md:py-20">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.19em] text-[#00754A]"
          style={{ fontFamily: P }}
        >
          Loteo
        </span>
        <h2
          className="mb-7 mt-2 text-[1.5rem] leading-[1.15] text-[#0E1A14] md:text-[2rem]"
          style={{ fontFamily: R, fontWeight: 300, letterSpacing: "-0.01em" }}
        >
          Plano de {nombre}
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Card plano / fallback WhatsApp */}
          {planoUrl && previewUrl ? (
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
              <div className="relative aspect-[16/10] w-full bg-[#eef3ef]">
                <Image
                  src={previewUrl}
                  alt={`Plano de lotes de ${nombre}`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 560px"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-1.5 text-[1.15rem] text-[#0E1A14]" style={{ fontFamily: R, fontWeight: 700 }}>
                  Plano de loteo
                </h3>
                <p className="mb-5 text-[14px] text-[#5C6B62]" style={{ fontFamily: P }}>
                  Mirá la distribución de lotes, amenities y espacios comunes en detalle.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={planoUrl}
                    download
                    onClick={() => trackEvent("barrios_descarga_plano", { slug, kind: "pdf" })}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1A5C38] px-5 py-3 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#0F3A23]"
                    style={{ fontFamily: P }}
                  >
                    <Download size={16} strokeWidth={2} aria-hidden />
                    Descargar plano (PDF)
                  </a>
                  <Link
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("barrios_descarga_plano", { slug, kind: "whatsapp" })}
                    className="inline-flex items-center gap-2 rounded-full border border-[#1A5C38] bg-white px-5 py-3 text-[13.5px] font-semibold text-[#1A5C38] transition-colors hover:bg-[#F5F8F5]"
                    style={{ fontFamily: P }}
                  >
                    <MessageCircle size={16} strokeWidth={2} aria-hidden />
                    Pedirlo por WhatsApp
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center gap-4 rounded-2xl border border-black/10 bg-white p-7">
              <div className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-[#1A5C38]/[0.08] text-[#1A5C38]">
                <FileText size={22} strokeWidth={1.8} aria-hidden />
              </div>
              <div>
                <h3 className="mb-1 text-[1.15rem] text-[#0E1A14]" style={{ fontFamily: R, fontWeight: 700 }}>
                  Masterplan de {nombre}
                </h3>
                <p className="text-[14px] leading-snug text-[#5C6B62]" style={{ fontFamily: P }}>
                  Te lo pasamos por WhatsApp al toque.
                </p>
              </div>
              <Link
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("barrios_descarga_plano", { slug, kind: "whatsapp-fallback" })}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-[#1A5C38] px-5 py-3 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#0F3A23]"
                style={{ fontFamily: P }}
              >
                <MessageCircle size={15} strokeWidth={2} aria-hidden />
                Pedir por WhatsApp
              </Link>
            </div>
          )}

          {/* Card destacada con foto */}
          {destacada && (
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
              <div className="relative aspect-[16/10] w-full bg-[#eef3ef]">
                <Image
                  src={destacada}
                  alt={`${nombre} — vista destacada`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 560px"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-1.5 text-[1.15rem] text-[#0E1A14]" style={{ fontFamily: R, fontWeight: 700 }}>
                  {destacadaTitular ?? `Conocé ${nombre}`}
                </h3>
                <p className="mb-5 text-[14px] text-[#5C6B62]" style={{ fontFamily: P }}>
                  Recorré el barrio en imágenes y descubrí cómo se vive adentro.
                </p>
                <a
                  href="#galeria"
                  className="inline-flex items-center gap-2 rounded-full border border-[#1A5C38] bg-white px-5 py-3 text-[13.5px] font-semibold text-[#1A5C38] transition-colors hover:bg-[#F5F8F5]"
                  style={{ fontFamily: P }}
                >
                  Ver galería →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
