"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

// Galería (fotos 02.webp en adelante) en grilla asimétrica —la primera foto
// ocupa 2x2— con lightbox propio liviano: estado local, cierre con X / click
// afuera / Escape, flechas prev-next. Si hay 0 fotos, no renderiza nada.

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif";
const P = "var(--font-poppins), 'Poppins', system-ui, sans-serif";

const MAX_FOTOS = 9;

export default function DetalleGaleria({ fotos, nombre }: { fotos: string[]; nombre: string }) {
  const visibles = fotos.slice(0, MAX_FOTOS);
  const [abierta, setAbierta] = useState<number | null>(null);

  const cerrar = useCallback(() => setAbierta(null), []);
  const prev = useCallback(
    () => setAbierta((i) => (i === null ? null : (i - 1 + visibles.length) % visibles.length)),
    [visibles.length],
  );
  const next = useCallback(
    () => setAbierta((i) => (i === null ? null : (i + 1) % visibles.length)),
    [visibles.length],
  );

  useEffect(() => {
    if (abierta === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [abierta, cerrar, prev, next]);

  if (visibles.length === 0) return null;

  return (
    <section id="galeria" className="scroll-mt-28 bg-[#F5F8F5] py-16 md:scroll-mt-32 md:py-20">
      <div className="mx-auto max-w-[1180px] px-6 md:px-8">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.19em] text-[#00754A]"
          style={{ fontFamily: P }}
        >
          Galería
        </span>
        <h2
          className="mb-7 mt-2 text-[1.5rem] leading-[1.15] text-[#0E1A14] md:text-[2rem]"
          style={{ fontFamily: R, fontWeight: 300, letterSpacing: "-0.01em" }}
        >
          Recorré {nombre}
        </h2>

        <div className="grid auto-rows-[150px] grid-cols-2 gap-3 md:auto-rows-[200px] md:grid-cols-4">
          {visibles.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setAbierta(i)}
              className={`group relative overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5C38] ${
                i === 0 ? "col-span-2 row-span-2" : ""
              }`}
              aria-label={`Ampliar foto ${i + 1} de ${nombre}`}
            >
              <Image
                src={src}
                alt={`${nombre} — foto ${i + 1}`}
                fill
                loading="lazy"
                sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <span
                aria-hidden
                className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-1.5 place-items-center rounded-full bg-white/92 text-[#1A5C38] opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
              >
                <Maximize2 size={15} strokeWidth={2.2} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox — galería clásica: portalizado a <body> para no quedar atrapado
          en el stacking context de la sección (y así tapar chat/alertas flotantes).
          Fondo oscuro sólido (inline, no depende de la opacidad de Tailwind),
          cerrar/flechas prominentes y contador. */}
      {abierta !== null && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${abierta + 1} de ${visibles.length}`}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8"
          style={{ background: "rgba(10, 12, 11, 0.97)" }}
          onClick={cerrar}
        >
          {/* Cerrar — botón claro y prominente, siempre visible */}
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar galería"
            className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full text-white transition-colors"
            style={{ background: "rgba(0, 0, 0, 0.55)" }}
          >
            <X size={24} strokeWidth={2.2} aria-hidden />
          </button>

          {visibles.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Foto anterior"
                className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white transition-colors md:left-6"
                style={{ background: "rgba(0, 0, 0, 0.55)" }}
              >
                <ChevronLeft size={26} strokeWidth={2.2} aria-hidden />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Foto siguiente"
                className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white transition-colors md:right-6"
                style={{ background: "rgba(0, 0, 0, 0.55)" }}
              >
                <ChevronRight size={26} strokeWidth={2.2} aria-hidden />
              </button>
            </>
          )}

          <div
            className="relative h-[78vh] w-full max-w-[1100px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={visibles[abierta]}
              alt={`${nombre} — foto ${abierta + 1} ampliada`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {/* Contador de fotos */}
          {visibles.length > 1 && (
            <span
              className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full px-4 py-1.5 text-[13px] font-semibold text-white"
              style={{ background: "rgba(0, 0, 0, 0.55)", fontFamily: P }}
            >
              {abierta + 1} / {visibles.length}
            </span>
          )}
        </div>,
        document.body,
      )}
    </section>
  );
}
