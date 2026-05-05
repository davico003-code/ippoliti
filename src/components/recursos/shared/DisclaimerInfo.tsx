export default function DisclaimerInfo() {
  return (
    <div
      className="rounded-2xl px-5 py-4 flex gap-3 items-start text-[13px] leading-relaxed"
      style={{
        background: '#FEF7EC',
        border: '1px solid #F0DEB8',
        color: '#6B5316',
      }}
    >
      <span
        aria-hidden
        className="flex-shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center font-poppins font-bold text-[13px] mt-[1px]"
        style={{ background: '#C99A3D', color: '#FFF6DC' }}
      >
        !
      </span>
      <div>
        <strong
          className="block font-bold uppercase tracking-[0.8px] text-[10.5px] mb-[3px]"
          style={{ color: '#4A3A0F' }}
        >
          Aclaración importante
        </strong>
        Los valores son meramente informativos y no contractuales. Pueden cambiar
        sin previo aviso. Consultá con la inmobiliaria en caso de dudas.
      </div>
    </div>
  )
}
