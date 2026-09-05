// GA4 event tracking helper
// Usage: trackEvent('click_whatsapp', { property_id: '123', property_title: 'Casa en Funes' })

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

export function trackEvent(eventName: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return
  if (window.gtag) {
    window.gtag('event', eventName, {
      ...params,
      page_location: window.location.href,
    })
  }
}

export function trackFbEvent(eventName: string, params?: Record<string, string | number | string[]>) {
  if (typeof window === 'undefined') return
  if (window.fbq) {
    window.fbq('track', eventName, params)
  }
}

// Evento custom del píxel (fbq('trackCustom')): para nombres que no son
// estándar de Meta, ej. 'TasacionRango'. Sirve para crear conversiones
// personalizadas y públicos sin ensuciar los eventos estándar.
export function trackFbCustomEvent(eventName: string, params?: Record<string, string | number | string[]>) {
  if (typeof window === 'undefined') return
  if (window.fbq) {
    window.fbq('trackCustom', eventName, params)
  }
}

// Pre-defined events
export const events = {
  clickWhatsapp: (propertyId?: number, title?: string) =>
    trackEvent('click_whatsapp', {
      property_id: String(propertyId ?? ''),
      property_title: title ?? '',
    }),

  clickCall: (propertyId?: number) =>
    trackEvent('click_call', { property_id: String(propertyId ?? '') }),

  viewProperty: (propertyId: number, title: string, price: string) => {
    trackEvent('view_property', {
      property_id: String(propertyId),
      property_title: title,
      property_price: price,
    })
    // content_type home_listing + content_ids = home_listing_id del feed de
    // catálogo (/api/meta/catalogo en HILO usa el tokko_id, que acá es
    // property.id): el match exacto que pide el retargeting de catálogo.
    trackFbEvent('ViewContent', {
      content_ids: [String(propertyId)],
      content_name: title,
      content_type: 'home_listing',
    })
  },

  shareProperty: (propertyId: number, method: string) =>
    trackEvent('share_property', {
      property_id: String(propertyId),
      method,
    }),

  submitTasacion: () => {
    trackEvent('submit_tasacion')
    trackFbEvent('Lead', { content_name: 'Tasación' })
  },

  useFilter: (filterName: string, value: string) =>
    trackEvent('use_filter', { filter_name: filterName, filter_value: value }),

  clickEmprendimiento: (name: string) =>
    trackEvent('click_emprendimiento', { emprendimiento_name: name }),

  recursosIndexView: () => trackEvent('recursos_index_view'),

  recursosCostosConstruccionView: () => trackEvent('recursos_costos_construccion_view'),

  calculadoraCostosView: () => trackEvent('calculadora_costos_view'),
  calculadoraCostosDescargar: () => trackEvent('calculadora_costos_descargar'),
  calculadoraCostosWhatsapp: () => {
    trackEvent('calculadora_costos_whatsapp_click')
    trackFbEvent('Lead', { content_name: 'Calculadora costos alquiler' })
  },

  calculadoraAjusteView: () => trackEvent('calculadora_ajuste_view'),
  calculadoraAjusteWhatsapp: () => {
    trackEvent('calculadora_ajuste_whatsapp_click')
    trackFbEvent('Lead', { content_name: 'Calculadora ajuste alquiler' })
  },

  fichaPropiedadCalculadoraClick: () => {
    trackEvent('ficha_propiedad_calculadora_click')
    trackFbEvent('Lead', { content_name: 'Ficha propiedad → Calculadora costos' })
  },
}
