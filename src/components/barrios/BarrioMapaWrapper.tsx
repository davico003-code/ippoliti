'use client'

import dynamic from 'next/dynamic'

const BarrioMapa = dynamic(() => import('./BarrioMapa'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[460px] items-center justify-center rounded-xl bg-stone-100">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
    </div>
  ),
})

export default BarrioMapa
