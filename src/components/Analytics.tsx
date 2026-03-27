'use client'

import Script from 'next/script'

// ═══════════════════════════════════════════════════════════
// REEMPLAZAR estos IDs con los reales antes de ir a producción
const GA_ID = 'G-6S5B227NFD'           // Google Analytics 4
const META_PIXEL_ID = '1822763421643141'  // Meta Pixel
// ═══════════════════════════════════════════════════════════

export default function Analytics() {
  // Don't load in development
  if (process.env.NODE_ENV !== 'production') return null
  if (GA_ID.includes('XXXX') && META_PIXEL_ID.includes('XXXX')) return null

  return (
    <>
      {/* Google Analytics 4 */}
      {!GA_ID.includes('XXXX') && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}

      {/* Meta Pixel */}
      {!META_PIXEL_ID.includes('XXXX') && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  )
}
