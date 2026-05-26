"use client";

// Accordeón de FAQs. Primera abierta por default. Usa HUB_FAQS existente.

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { HUB_FAQS } from "@/lib/barrios/faq";

export default function FaqBarrios() {
  const [openIdx, setOpenIdx] = useState<number>(0);

  return (
    <section
      className="bp-faq-section"
      style={{
        background: "#FAF7F2",
        padding: "80px 0",
      }}
    >
      <div
        className="bp-faq-container"
        style={{ maxWidth: 820, margin: "0 auto", padding: "0 32px" }}
      >
        <h2
          style={{
            fontFamily: "var(--font-raleway), 'Raleway', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 36,
            letterSpacing: "-0.015em",
            color: "#0a0a0a",
            margin: "0 0 8px",
          }}
        >
          Preguntas frecuentes
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#777",
            margin: "0 0 36px",
            fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
          }}
        >
          Lo que más nos consultan sobre el corredor.
        </p>

        <div role="list">
          {HUB_FAQS.map((faq, i) => {
            const open = openIdx === i;
            return (
              <div
                key={faq.pregunta}
                role="listitem"
                className="bp-faq-item"
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  marginBottom: 10,
                  boxShadow: "0 1px 3px rgba(10,10,10,.05)",
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? -1 : i)}
                  aria-expanded={open}
                  className="bp-faq-q"
                  style={{
                    width: "100%",
                    padding: "20px 24px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    textAlign: "left",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#0a0a0a",
                    fontFamily:
                      "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                    transition: "color 150ms",
                  }}
                >
                  <span>{faq.pregunta}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      flexShrink: 0,
                      transform: open ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 250ms ease",
                      color: "#777",
                    }}
                    aria-hidden
                  />
                </button>
                <div
                  style={{
                    maxHeight: open ? 500 : 0,
                    overflow: "hidden",
                    transition: "max-height 300ms ease",
                  }}
                >
                  <div
                    style={{
                      padding: "0 24px 22px",
                      fontSize: 14,
                      lineHeight: 1.65,
                      color: "#444",
                      fontFamily:
                        "var(--font-poppins), 'Poppins', system-ui, sans-serif",
                    }}
                  >
                    {faq.respuesta}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `.bp-faq-q:hover { color: #1A5C38 !important; }`,
        }}
      />
    </section>
  );
}
