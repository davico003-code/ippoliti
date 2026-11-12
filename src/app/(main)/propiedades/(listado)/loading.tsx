// Este loading vive en el grupo (listado) A PROPÓSITO, junto al page.tsx del
// listado. Next corta el prefetch de un <Link> en el primer segmento con
// loading.tsx que difiera de la ruta actual. Cuando el listado colgaba directo
// de /propiedades, desde una ficha (/propiedades/[slug]) el segmento que
// difería era la página misma, sin loading propio: cada link a /propiedades
// (botón "Mapa", Comprar, Alquilar, footer) bajaba el listado ENTERO (~1 MB,
// 113 KB comprimido) en cada visita a una ficha. Con el grupo, el prefetch
// trae solo este esqueleto. La URL no cambia (los grupos no la tocan).
//
// Mismo armazón que PropiedadesView (25-oct-2026): antes era una grilla de dos
// columnas con un header de 56 px, otra geometría que la real, y al volver de
// una ficha todo saltaba de lugar. Ahora el contenido "aterriza" donde estaba
// el esqueleto: celu = header de dos filas + tarjetas 16:9 a una columna;
// compu = barra de filtros + lista al 48 % + mapa. page.tsx usa este mismo
// componente como fallback del Suspense.
import PropiedadesViewDesktopGridSkeleton from '@/components/PropiedadesViewDesktopGridSkeleton'

export default function Loading() {
  return (
    <div
      className="h-[100dvh] md:h-[calc(100dvh-61px)] lg:h-[calc(100dvh-var(--header-height))] flex flex-col bg-white overflow-hidden"
      aria-busy="true"
      aria-label="Cargando propiedades"
    >
      {/* ── Celu: header de dos filas (buscador + Venta/Alquiler/Filtros) ── */}
      <div className="md:hidden flex-shrink-0 bg-white border-b border-gray-200 animate-pulse">
        <div className="flex items-center gap-2 px-3 pb-2 pt-[max(8px,env(safe-area-inset-top))]">
          <div className="w-11 h-11 rounded-full bg-gray-100 flex-shrink-0" />
          <div className="flex-1 h-11 rounded-xl bg-gray-100" />
          <div className="w-11 h-11 rounded-full bg-gray-100 flex-shrink-0" />
        </div>
        <div className="flex items-center gap-2 px-3 pb-2">
          <div className="flex-1 h-11 rounded-full bg-gray-100" />
          <div className="w-[104px] h-11 rounded-xl bg-gray-100 flex-shrink-0" />
        </div>
      </div>

      {/* ── Compu: barra de filtros (57 px como la real) ── */}
      <div className="hidden md:flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white flex-shrink-0 animate-pulse">
        <div className="w-[240px] h-10 rounded-xl bg-gray-100 flex-shrink-0" />
        <div className="w-px h-6 bg-gray-200 flex-shrink-0" />
        {[112, 104, 120, 88, 104].map((w, i) => (
          <div key={i} className="h-10 rounded-xl bg-gray-100 flex-shrink-0" style={{ width: w }} />
        ))}
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex flex-col w-full md:w-[48%] md:flex-shrink-0 md:border-r border-gray-200 overflow-hidden">
          {/* Compu: fila gris de Ordenar + contador */}
          <div className="hidden md:flex h-[41px] px-3 items-center bg-gray-50 border-b border-gray-100 flex-shrink-0">
            <div className="h-7 w-24 rounded-lg bg-gray-200 animate-pulse" />
          </div>
          {/* Celu: renglón del contador + tarjetas a una columna */}
          <div className="md:hidden animate-pulse" aria-hidden="true">
            <div className="h-11 px-4 flex items-center">
              <div className="h-3.5 w-40 rounded bg-gray-100" />
            </div>
            <div className="px-4 pt-1 space-y-3">
              {[0, 1, 2].map(i => (
                <div key={i}>
                  <div className="w-full aspect-[16/9] rounded-[14px] bg-gray-200" />
                  <div className="px-0.5 py-2 space-y-2">
                    <div className="h-5 w-28 rounded bg-gray-200" />
                    <div className="h-3 w-3/4 rounded bg-gray-100" />
                    <div className="h-3 w-1/2 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <PropiedadesViewDesktopGridSkeleton />
          </div>
        </div>
        {/* Compu: el mapa (gris quieto, sin pulso: es fondo, no contenido) */}
        <div className="hidden md:block flex-1 bg-gray-100" />
      </div>
    </div>
  )
}
