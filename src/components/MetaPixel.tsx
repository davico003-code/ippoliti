'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

// Meta Pixel — activa solo si NEXT_PUBLIC_META_PIXEL_ID está definido (mismo
// patrón que GoogleAnalytics). afterInteractive (no lazyOnload): el stub de
// fbq tiene que existir ANTES de que la ficha dispare ViewContent en su
// hidratación — con lazyOnload el evento se perdía en cargas directas.
// El PageView extra por pathname cubre las navegaciones client-side del App
// Router (el snippet solo cuenta la primera página).
export default function MetaPixel() {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    if (!id) return
    if (first.current) {
      first.current = false // el snippet ya mandó el PageView inicial
      return
    }
    window.fbq?.('track', 'PageView')
  }, [id, pathname])

  if (!id) return null

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  )
}
