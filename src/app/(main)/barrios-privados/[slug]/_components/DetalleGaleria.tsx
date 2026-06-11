"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Galería (fotos 02.webp en adelante, máx. 6) con lightbox propio liviano:
// estado local, cierre con X / click afuera / Escape, flechas prev-next.
// Si el barrio tiene 0 fotos de galería, el componente no renderea nada.

const R = "var(--font-raleway), 'Raleway', system-ui, sans-serif";

const MAX_FOTOS = 6;

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
    // bloquear scroll del body mientras el lightbox está abierto
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [abierta, cerrar, prev, next]);

  if (visibles.length === 0) return null;

  return (
    <section className="bg-[#FAF7F2] py-14 md:py-20">
      <div className="mx-auto max-w-[1280px] px-6 md:px-10">
        <h2
          className="mb-8 text-2xl text-[#0a0a0a] md:text-[28px]"
          style={{ fontFamily: R, fontWeight: 700, letterSpacing: "-0.015em" }}
        >
          {nombre}, en fotos
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setAbierta(i)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[#e8e2d5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5C38]"
              aria-label={`Ampliar foto ${i + 1} de ${nombre}`}
            >
              <Image
                src={src}
                alt={`${nombre} — foto ${i + 1}`}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {abierta !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${abierta + 1} de ${visibles.length}`}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 p-4"
          onClick={cerrar}
        >
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/25"
          >
            <X size={22} strokeWidth={2} aria-hidden />
          </button>

          {visibles.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Foto anterior"
                className="absolute left-3 z-10 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/25 md:left-6"
              >
                <ChevronLeft size={24} strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Foto siguiente"
                className="absolute right-3 z-10 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/25 md:right-6"
              >
                <ChevronRight size={24} strokeWidth={2} aria-hidden />
              </button>
            </>
          )}

          <div
            className="relative h-[80vh] w-full max-w-[1100px]"
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
        </div>
      )}
    </section>
  );
}
