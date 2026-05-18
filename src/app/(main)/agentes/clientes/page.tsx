import { redirect } from 'next/navigation'

// Ruta deprecada. El Seguimiento de Clientes vive ahora en /agentes/seleccion.
// Server-side redirect para no romper bookmarks de agentes.
export default function AgentesClientesPage() {
  redirect('/agentes/seleccion')
}
