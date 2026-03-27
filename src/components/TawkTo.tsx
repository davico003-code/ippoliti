'use client'

import Script from 'next/script'

// ═══════════════════════════════════════════════════════════
// REEMPLAZAR con tu ID real de Tawk.to
// Lo encontrás en: Tawk.to → Settings → Chat Widget → Direct Chat Link
// Formato: https://tawk.to/chat/XXXXXXXXXXXXXXXXXXXXXXXX/XXXXXXXXX
const TAWK_ID = 'XXXXXXXXXXXXXXXXXXXXXXXX/XXXXXXXXX'
// ═══════════════════════════════════════════════════════════

export default function TawkTo() {
  if (TAWK_ID.includes('XXXX')) return null

  return (
    <Script id="tawk-to" strategy="afterInteractive">
      {`var Tawk_API=Tawk_API||{},Tawk_LoadStart=new Date();(function(){var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];s1.async=true;s1.src='https://embed.tawk.to/${TAWK_ID}';s1.charset='UTF-8';s1.setAttribute('crossorigin','*');s0.parentNode.insertBefore(s1,s0);})();`}
    </Script>
  )
}
