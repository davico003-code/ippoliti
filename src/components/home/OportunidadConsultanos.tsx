// El par "OPORTUNIDAD" + "Consultanos →" de las tarjetas de la home, en UN
// solo lugar para el celu (SeleccionCarousel) y la compu (page.tsx). Antes eran
// dos copias y la del celu usaba text-gray-900, que el modo oscuro remapea a
// casi blanco: quedaba blanco sobre amarillo, ilegible. Los colores van fijos
// a propósito: el amarillo de marca lleva tinta negra en los dos modos.
// Raleway (es texto, no número) y 12 px como piso de legibilidad.

const RALEWAY = "var(--font-raleway, 'Raleway'), system-ui, sans-serif"

export default function OportunidadConsultanos({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...style }}>
      <span
        style={{
          fontFamily: RALEWAY,
          fontWeight: 800,
          fontSize: 12,
          lineHeight: 1,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          background: '#fbce07',
          color: '#111',
          borderRadius: 6,
          padding: '6px 9px',
          whiteSpace: 'nowrap',
        }}
      >
        Oportunidad
      </span>
      <span
        style={{
          fontFamily: RALEWAY,
          fontWeight: 700,
          fontSize: 14,
          background: '#1A5C38',
          color: '#fff',
          borderRadius: 9999,
          padding: '6px 15px',
          whiteSpace: 'nowrap',
        }}
      >
        Consultanos →
      </span>
    </div>
  )
}
