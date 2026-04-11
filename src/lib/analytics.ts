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

export function trackFbEvent(eventName: string, params?: Record<string, string | number>) {
  if (typeof window === 'undefined') return
  if (window.fbq) {
    window.fbq('track', eventName, params)
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
    trackFbEvent('ViewContent', {
      content_ids: String(propertyId),
      content_name: title,
      content_type: 'property',
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
}
