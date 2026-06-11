"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, MessageCircle, FileText } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

// Plano del barrio: preview grande sobre fondo paper + descarga PDF directa
// + alternativa por WhatsApp. Sin plano → solo el bloque de WhatsApp (igual
// que la ficha anterior).

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif";
const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif";

export default function DetallePlano({
  slug,
  nombre,
  planoUrl,
  previewUrl,
}: {
  slug: string;
  nombre: string;
  planoUrl: string | null;
  previewUrl: string | null;
}) {
  const waText = `Hola SI, ¿me pasan el plano de ${nombre}?`;
  const waUrl = `https://wa.me/5493412101694?text=${encodeURIComponent(waText)}`;

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <h2
          className="mb-8 text-2xl text-[#0a0a0a] md:text-[28px]"
          style={{ fontFamily: R, fontWeight: 700, letterSpacing: "-0.015em" }}
        >
          Plano de {nombre}
        </h2>

        {planoUrl && previewUrl ? (
          <div className="overflow-hidden rounded-2xl border border-[#e8e2d5] bg-[#FAF7F2]">
            <div className="p-4 md:p-8">
              <div className="relative mx-auto w-full max-w-[900px] overflow-hidden rounded-lg border border-[#e8e2d5] bg-white">
                <Image
                  src={previewUrl}
                  alt={`Plano de lotes de ${nombre}`}
                  width={1600}
                  height={1100}
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 900px"
                  className="h-auto w-full"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-[#e8e2d5] bg-white px-6 py-5">
              <a
                href={planoUrl}
                download
                onClick={() => trackEvent("barrios_descarga_plano", { slug, kind: "pdf" })}
                className="inline-flex items-center gap-2 rounded-full bg-[#1A5C38] px-6 py-3 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#0F3F26]"
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
                className="inline-flex items-center gap-2 rounded-full border border-[#1A5C38] bg-white px-6 py-3 text-[13.5px] font-semibold text-[#1A5C38] transition-colors hover:bg-[#FAF7F2]"
                style={{ fontFamily: P }}
              >
                <MessageCircle size={16} strokeWidth={2} aria-hidden />
                Pedirlo por WhatsApp
              </Link>
            </div>
          </div>
        ) : (
          /* Sin plano: bloque WhatsApp como en la ficha anterior */
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#e8e2d5] bg-[#FAF7F2] p-6">
            <div className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[10px] bg-[#1A5C38]/[0.08] text-[#1A5C38]">
              <FileText size={22} strokeWidth={1.8} aria-hidden />
            </div>
            <div className="min-w-[200px] flex-1">
              <h3
                className="mb-1 text-base text-[#0a0a0a]"
                style={{ fontFamily: R, fontWeight: 600 }}
              >
                Masterplan de {nombre}
              </h3>
              <p className="text-[13.5px] leading-snug text-[#777]" style={{ fontFamily: P }}>
                Te lo pasamos por WhatsApp al toque.
              </p>
            </div>
            <Link
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("barrios_descarga_plano", { slug, kind: "whatsapp-fallback" })}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[#e8e2d5] bg-white px-[18px] py-2.5 text-[13px] font-semibold text-[#0a0a0a]"
              style={{ fontFamily: P }}
            >
              <MessageCircle size={15} strokeWidth={2} aria-hidden />
              Pedir por WhatsApp
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
