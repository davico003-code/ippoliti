interface DepositoCardProps {
  // Monto ya formateado ("$ 700.000" / "US$ 700,00"). Si falta (alquiler
  // vacío), la card muestra solo "1 mes de alquiler" sin monto.
  alquilerFmt?: string
}

export default function DepositoCard({ alquilerFmt }: DepositoCardProps) {
  return (
    <div
      className="rounded-2xl p-6 md:p-7 text-white shadow-sm relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, var(--usd) 0%, var(--usd-dark) 100%)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 80% 0%, rgba(255,255,255,0.10) 0%, transparent 55%)',
        }}
      />
      <div className="relative">
        <div
          className="text-[11px] font-bold uppercase tracking-[1.6px] mb-2"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          Depósito de garantía
        </div>
        <div className="font-poppins font-bold text-[clamp(28px,6vw,38px)] leading-none tracking-tight">
          1 mes de alquiler{alquilerFmt ? ` · ${alquilerFmt}` : ''}
        </div>
        <div
          className="text-sm font-medium mt-2"
          style={{ color: 'rgba(255,255,255,0.78)' }}
        >
          Se entrega al ingresar al inmueble. Se devuelve al finalizar el contrato.
        </div>
      </div>
    </div>
  )
}
