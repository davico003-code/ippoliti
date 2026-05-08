// Skeleton del DesktopGrid — renderizado en SSR + durante hidratación
// para evitar CLS hasta que el cliente monta el componente real.
// Estructura idéntica al grid real: mismo grid-cols, gap, padding y
// aspect-ratio de cards. animate-pulse para comunicar "cargando".

export default function PropiedadesViewDesktopGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid p-4 grid-cols-1 xl:grid-cols-2 gap-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[14px] border border-gray-200 overflow-hidden bg-white animate-pulse"
        >
          {/* Imagen — aspect-[2/1] como PropiedadCardGrid */}
          <div className="relative w-full bg-gray-200 aspect-[2/1]" />

          {/* Body — 8px 12px padding, 3 líneas como la card real */}
          <div className="px-3 py-2 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-gray-200 rounded" />
              <div className="h-5 w-5 bg-gray-100 rounded-full" />
            </div>
            <div className="h-3 w-3/4 bg-gray-100 rounded" />
            <div className="h-3 w-1/2 bg-gray-100 rounded" />
            <div className="h-3 w-2/5 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
