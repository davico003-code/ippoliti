// Esqueleto instantáneo del panel: /agentes es force-dynamic y tarda en
// resolver en el servidor. Con este boundary la navegación responde al toque
// y Next puede precargar el shell de la ruta.
export default function Loading() {
  return (
    <div className="min-h-[70vh] animate-pulse px-4 py-8 md:px-8" aria-busy="true" aria-label="Cargando panel">
      <div className="mx-auto max-w-6xl">
        <div className="h-40 rounded-2xl bg-gray-200 md:h-56" />
        <div className="mt-6 h-6 w-48 rounded bg-gray-200" />
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-28 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  )
}
