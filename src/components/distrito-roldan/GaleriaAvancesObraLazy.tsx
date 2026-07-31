'use client'

import dynamic from 'next/dynamic'

const GaleriaAvancesObra = dynamic(() => import('./GaleriaAvancesObra'), {
  ssr: false,
  loading: () => <div className="aspect-[9/8] w-full animate-pulse bg-[#345544]/10" />,
})

export default function GaleriaAvancesObraLazy() {
  return <GaleriaAvancesObra />
}
