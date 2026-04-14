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

  // Modo stub si no hay credenciales Twilio (dev local sin setup)
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn(
      `[whatsapp] MODO STUB - configurar Twilio env vars. destino=${ADMIN_NUMBER} len=${body.length} preview="${body.slice(0, 80)}..."`,
    );
    return;
  }

  await enviarWhatsApp({ to: ADMIN_NUMBER, body });
}

export function getAdminNumber(): string {
  return ADMIN_NUMBER;
}
