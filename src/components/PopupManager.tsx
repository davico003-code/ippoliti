'use client'

import { useState, useEffect } from 'react'
import OpenHousePopup from './OpenHousePopup'
import ExitPopup from './ExitPopup'

// Open House runs until April 16, 2026 23:59:59 ART (UTC-3)
// April 17 00:00:00 ART = April 17 03:00:00 UTC
const CUTOFF = new Date('2026-04-17T03:00:00Z')

export default function PopupManager() {
  const [isOpenHousePeriod, setIsOpenHousePeriod] = useState<boolean | null>(null)

  useEffect(() => {
    setIsOpenHousePeriod(new Date() < CUTOFF)
  }, [])

  // Wait for client-side date check
  if (isOpenHousePeriod === null) return null

  if (isOpenHousePeriod) {
    return <OpenHousePopup />
  }

  return <ExitPopup />
}
