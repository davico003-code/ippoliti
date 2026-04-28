// Alarma de fallback para fallos en el pipeline del blog.
//
// Estrategia:
//   1. Intentar enviar WhatsApp al admin (canal primario).
//   2. Si falla, emitir log con prefijo [ALERT] a stderr (siempre, grepeable
//      en Vercel logs) y, si está configurado Resend, mandar email.
//   3. Re-lanzar la excepción para que el cron route devuelva 500 y Vercel
//      marque el deployment como failed.

import { enviarWhatsAppAdmin } from './whatsapp';

async function emitirAlerta(asunto: string, cuerpo: string): Promise<void> {
  // SIEMPRE dejar el [ALERT] en stderr — esto es el fallback mínimo si Resend
  // no está configurado o también falla. Buscar en Vercel con `vercel logs -q "[ALERT]"`.
  console.error(`[ALERT] ${asunto}\n${cuerpo}`);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_EMAIL_FROM;
  const to = process.env.ALERT_EMAIL_TO;
  if (!apiKey || !from || !to) {
    return; // sin email configurado, alcanza con el [ALERT] log
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject: asunto, text: cuerpo }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error(`[ALERT] Resend respondió ${res.status}: ${txt.slice(0, 200)}`);
    }
  } catch (e) {
    console.error(
      `[ALERT] Resend fetch falló: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
}

/**
 * Intenta notificar por WhatsApp. Si falla, emite [ALERT] y re-lanza.
 * Re-lanzar deja que el cron route capture y devuelva 500 (visible en Vercel).
 */
export async function notificarConAlerta(
  mensaje: string,
  contexto: string,
): Promise<void> {
  try {
    await enviarWhatsAppAdmin(mensaje);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await emitirAlerta(
      `[BLOG ALERT] WhatsApp falló — ${contexto}`,
      `Contexto: ${contexto}\n\nMensaje original que no se pudo entregar:\n${mensaje}\n\nError: ${errMsg}`,
    );
    throw err;
  }
}
