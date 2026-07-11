import MetaPixelSpa from './MetaPixelSpa'

// Meta Pixel — activa solo si NEXT_PUBLIC_META_PIXEL_ID está definido (mismo
// patrón que GoogleAnalytics). Es un componente de SERVIDOR a propósito: el
// snippet va inline en el HTML inicial y el navegador lo ejecuta durante el
// parseo, ANTES de la hidratación de React. Así el stub de fbq ya existe
// cuando la ficha dispara ViewContent en su primer efecto — con next/script
// (afterInteractive/lazyOnload) ese evento se perdía por carrera.
export default function MetaPixel() {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID
  if (!id) return null

  const snippet = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`

  return (
    <>
      <script id="meta-pixel" dangerouslySetInnerHTML={{ __html: snippet }} />
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
      <MetaPixelSpa />
    </>
  )
}
