import type { Barrio } from "@/lib/barrios";

// Slot para expensas mensuales. Si barrio.expensas tiene valor → muestra el valor.
// Si no → muestra "Consultar" + nota de que el dato está en proceso de carga.

export default function FichaExpensasSlot({ barrio }: { barrio: Barrio }) {
  const tieneValor = !!(barrio.expensas && barrio.expensas.trim());

  return (
    <section style={{ background: "#FAF7F2", padding: "24px 0", borderTop: "1px solid #e8e2d5", borderBottom: "1px solid #e8e2d5" }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#B8935A",
            fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
          }}
        >
          Expensas mensuales
        </span>
        <span
          style={{
            fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 18,
            color: tieneValor ? "#0a0a0a" : "#777",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {tieneValor ? barrio.expensas : "Consultar"}
        </span>
        {!tieneValor && (
          <span style={{ fontSize: 12, color: "#999", fontFamily: "var(--font-poppins), 'Poppins', system-ui, sans-serif" }}>
            Próximamente publicamos el valor actualizado.
          </span>
        )}
      </div>
    </section>
  );
}
