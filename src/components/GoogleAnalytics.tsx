'use client'

// GA4 stub — activa solo si NEXT_PUBLIC_GA_ID está definido. Si no,
// renderiza null (no se envía ningún script). El ID se configura en
// Vercel y .env.local: NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
import Script from 'next/script'

export default function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID
  if (!id) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', { send_page_view: true, anonymize_ip: true });
        `}
      </Script>
    </>
  )
}
