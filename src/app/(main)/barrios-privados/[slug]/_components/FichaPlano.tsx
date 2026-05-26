"use client";

import Link from "next/link";
import { Download, MessageCircle, FileText } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

// Card compacta con el plano. Si está cargado en /public/barrios/{slug}/plano.pdf,
// botón "Descargar PDF". Si no, fallback a WhatsApp "pedí el plano".
// Sin italic (AI tell).

export default function FichaPlano({
  slug,
  nombre,
  planoUrl,
}: {
  slug: string;
  nombre: string;
  planoUrl: string | null;
}) {
  const waText = `Hola SI, ¿me pasan el plano de ${nombre}?`;
  const waUrl = `https://wa.me/5493412101694?text=${encodeURIComponent(waText)}`;

  return (
    <section style={{ background: "#fff", padding: "40px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <h2
          style={{
            fontFamily: "var(--font-raleway), 'Raleway', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "#0a0a0a",
            margin: "0 0 18px",
            letterSpacing: "-0.01em",
          }}
        >
          Plano del barrio
        </h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: 22,
            background: "#FAF7F2",
            border: "1px solid #e8e2d5",
            borderRadius: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              background: "rgba(26,92,56,0.08)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1A5C38",
              flexShrink: 0,
            }}
          >
            <FileText size={22} strokeWidth={1.8} aria-hidden />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h3
              style={{
                fontFamily: "var(--font-raleway), 'Raleway', system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 16,
                color: "#0a0a0a",
                margin: "0 0 4px",
              }}
            >
              Masterplan de {nombre}
            </h3>
            <p
              style={{
                fontSize: 13.5,
                color: "#777",
                margin: 0,
                fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                lineHeight: 1.45,
              }}
            >
              {planoUrl
                ? "PDF con lotes, amenities y manzaneo."
                : "Te lo pasamos por WhatsApp al toque."}
            </p>
          </div>
          {planoUrl ? (
            <Link
              href={planoUrl}
              target="_blank"
              rel="noopener"
              download
              onClick={() => trackEvent("barrios_descarga_plano", { slug, kind: "pdf" })}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                background: "#1A5C38",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 999,
                textDecoration: "none",
                fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              <Download size={15} strokeWidth={2} aria-hidden />
              Descargar PDF
            </Link>
          ) : (
            <Link
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("barrios_descarga_plano", { slug, kind: "whatsapp-fallback" })}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                background: "#fff",
                color: "#0a0a0a",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 999,
                border: "1px solid #e8e2d5",
                textDecoration: "none",
                fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              <MessageCircle size={15} strokeWidth={2} aria-hidden />
              Pedir por WhatsApp
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
