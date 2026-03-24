import Link from 'next/link'
import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <div className="bg-brand-600 rounded-xl w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-black text-4xl leading-none">SI</span>
        </div>
        <h1 className="text-7xl font-black text-gray-100 mb-2">404</h1>
        <h2 className="text-2xl font-black text-gray-900 mb-3">Página no encontrada</h2>
        <p className="text-gray-500 max-w-sm mx-auto">
          La página que buscás no existe o fue movida.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors"
        >
          Ir al inicio
        </Link>
        <Link
          href="/propiedades"
          className="px-6 py-3 border-2 border-brand-600 text-brand-600 hover:bg-brand-600 hover:text-white font-semibold rounded-lg transition-colors flex items-center gap-2 justify-center"
        >
          <Search className="w-4 h-4" />
          Ver propiedades
        </Link>
      </div>
    </div>
  )
}
