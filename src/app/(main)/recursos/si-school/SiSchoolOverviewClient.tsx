'use client'

import TeamCodeGate from '@/components/si-school/TeamCodeGate'

export default function SiSchoolOverviewClient() {
  return (
    <TeamCodeGate>
      {() => (
        <div className="min-h-screen flex items-center justify-center font-raleway" style={{ background: '#FAFAF9' }}>
          <div className="text-center px-6">
            <p className="font-poppins text-[11px] uppercase font-semibold mb-2" style={{ color: '#1A5C38', letterSpacing: '0.18em' }}>
              ● SI School
            </p>
            <h1 className="text-[28px] font-bold mb-3" style={{ color: '#09090B' }}>
              Sistema operativo del agente
            </h1>
            <p className="text-[14px]" style={{ color: '#71717A' }}>
              Cargando interfaz…
            </p>
          </div>
        </div>
      )}
    </TeamCodeGate>
  )
}
