// template.tsx se re-monta en cada navegación (a diferencia de layout.tsx, que
// persiste). Envolvemos el contenido de la página en un fade de entrada para que
// moverse por el sitio se sienta suave y premium, sin cortes secos. Solo anima
// opacidad → no crea containing block, así los elementos position:fixed de la
// página (barras sticky, popups) no se descolocan durante la transición.

export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="si-page-enter">{children}</div>
}
