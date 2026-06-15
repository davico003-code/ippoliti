// DESACTIVADO (jun-2026) — Radar autónomo.
//
// Este webhook recibía la respuesta de David por WhatsApp ("1,3") para aprobar
// los temas del radar. El pipeline ahora es 100% autónomo: el writer de
// martes/viernes auto-selecciona de la cola del radar (blog:temas_semana) y
// publica solo, sin aprobación humana ni WhatsApp.
//
// Se deja como no-op (responde TwiML vacío con 200 para que Twilio no
// reintente) en vez de borrarlo, por si quedó configurado como webhook de
// inbound en la consola de Twilio. No lee Redis ni envía nada.
//
// El cliente Twilio y enviarWhatsAppAdmin NO se tocan: son infra compartida
// con placas y agendar-visita.

export const dynamic = 'force-dynamic';

const TWIML_VACIO = '<Response></Response>';

export async function POST() {
  return new Response(TWIML_VACIO, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}
