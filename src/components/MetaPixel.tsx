import MetaPixelSpa from './MetaPixelSpa'
import Script from 'next/script'

// Meta Pixel — activa solo si NEXT_PUBLIC_META_PIXEL_ID está definido (mismo
// patrón que GoogleAnalytics). Es un componente de SERVIDOR a propósito: el
// El stub queda disponible antes de hidratar para encolar PageView/ViewContent,
// pero el script pesado de Meta se descarga después de onload.
export default function MetaPixel() {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID
  if (!id) return null

  const snippet = `!function(f,n){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}(window);fbq('init','${id}');fbq('track','PageView');`

  return (
    <>
      <script id="meta-pixel" dangerouslySetInnerHTML={{ __html: snippet }} />
      <Script
        id="meta-pixel-library"
        src="https://connect.facebook.net/en_US/fbevents.js"
        strategy="lazyOnload"
      />
      {/*
        El respaldo sin-JS va como HTML crudo y NO como hijos JSX.
        Con hijos, React reconstruye el <img> como nodo real del DOM al
        reconciliar, y el navegador lo descarga aunque el visitante SÍ tenga
        JavaScript: eso mandaba un segundo PageView y duplicaba lo que reporta
        la pauta. Seteado por innerHTML, el navegador deja el contenido del
        <noscript> como texto mientras hay scripting, y solo lo interpreta como
        markup cuando el visitante no tiene JS, que es para lo que está.
      */}
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1"/>`,
        }}
      />
      <MetaPixelSpa />
    </>
  )
}
