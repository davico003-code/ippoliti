// Panel del equipo SI para generar audio narrado por IA con ElevenLabs.
// Acceso gateado por código del equipo (SI_TEAM_CODE) — todo el flujo vive
// en AdminAudioClient.

import AdminAudioClient from './AdminAudioClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Audio narrado · SI INMOBILIARIA',
  robots: { index: false, follow: false },
}

export default function AdminAudioPage() {
  return <AdminAudioClient />
}
