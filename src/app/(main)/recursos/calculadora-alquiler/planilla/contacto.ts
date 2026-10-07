// Línea de Administración (alquileres) que figura en la planilla impresa.
// Módulo aparte para que page.tsx (server, arma el QR) y PlanillaPrintable
// (client, muestra el número) lean el mismo dato.
export const WHATSAPP_NUM = '5493413415159'
export const WHATSAPP_DISPLAY = '+54 9 341 341 5159'
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(
  'Hola, tengo una consulta sobre los costos para alquilar',
)}`
