import { listarSelecciones } from '@/lib/redis'
import AgentSeleccionPanel from '@/components/seleccion/AgentSeleccionPanel'

export const dynamic = 'force-dynamic'

export default async function AgentesSeleccionPage() {
  let sessions: Awaited<ReturnType<typeof listarSelecciones>> = []
  try {
    sessions = await listarSelecciones()
  } catch {}

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/agentes" className="text-gray-400 hover:text-gray-600 text-sm">&larr; Panel</a>
          <span className="text-gray-200">|</span>
          <span className="text-sm font-bold text-gray-900">Selecciones</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <AgentSeleccionPanel initialSessions={sessions as any[]} />
      </div>
    </div>
  )
}
