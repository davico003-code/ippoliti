import { enviarWhatsApp } from '@/lib/twilio-client';

const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER ?? '+5493413340916';
const MAX_LEN = 1500;

function truncar(mensaje: string): string {
  if (mensaje.length <= MAX_LEN) return mensaje;
  return `${mensaje.slice(0, 1497)}...`;
}

export async function enviarWhatsAppAdmin(mensaje: string): Promise<void> {
  if (!mensaje || !mensaje.trim()) {
    throw new Error('enviarWhatsAppAdmin: mensaje vacío');
  }

  const body = truncar(mensaje);
  const tail4 = ADMIN_NUMBER.slice(-4);
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    const faltan = [!sid && 'TWILIO_ACCOUNT_SID', !token && 'TWILIO_AUTH_TOKEN']
      .filter(Boolean)
      .join(', ');
    // Producción: fallar ruidosamente — el cron responde 500 y queda visible en Vercel.
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `[whatsapp] Twilio no configurado en producción. Faltan: ${faltan}`,
      );
    }
    // Dev: mantener stub para poder correr local sin Twilio.
    console.warn(
      `[whatsapp] MODO STUB (dev) — faltan: ${faltan}. destino=***${tail4} len=${body.length}`,
    );
    return;
  }

  console.log(`[whatsapp] Enviando ${body.length} chars a ***${tail4}`);
  const res = await enviarWhatsApp({ to: ADMIN_NUMBER, body });
  console.log(`[whatsapp] sid=${res.sid} status=${res.status} → ***${tail4}`);

  // Twilio acepta el envío con status="queued" o "accepted" pero eso NO garantiza delivery.
  // En el sandbox de Twilio, si el destinatario no mandó "join <código>" en las últimas 72h,
  // el mensaje queda silenciosamente sin entregar.
  if (res.status === 'queued' || res.status === 'accepted') {
    console.warn(
      `[whatsapp] status=${res.status} — Twilio aceptó el mensaje pero no confirma delivery. ` +
        `Si usás Twilio Sandbox y el admin no envió "join <código>" en las últimas 72h, el mensaje NO llega. ` +
        `Verificá en Twilio Console → Messaging → Try it out → WhatsApp.`,
    );
  }
}

export function getAdminNumber(): string {
  return ADMIN_NUMBER;
}
