import twilio, { type Twilio } from 'twilio';

const MAX_RETRIES = 3;
const DEFAULT_FROM = 'whatsapp:+14155238886'; // Twilio Sandbox

let _client: Twilio | null = null;

export function getTwilioClient(): Twilio {
  if (_client) return _client;

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    throw new Error(
      'TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN deben estar configurados en el entorno',
    );
  }

  _client = twilio(sid, token);
  return _client;
}

function ensureWhatsAppPrefix(to: string): string {
  return to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
}

interface EnviarWhatsAppParams {
  to: string;
  body: string;
}

interface EnviarWhatsAppResult {
  sid: string;
  status: string;
}

export async function enviarWhatsApp(
  params: EnviarWhatsAppParams,
): Promise<EnviarWhatsAppResult> {
  const client = getTwilioClient();
  const from = process.env.TWILIO_WHATSAPP_FROM ?? DEFAULT_FROM;
  const to = ensureWhatsAppPrefix(params.to);

  let lastError: unknown;

  for (let intento = 0; intento < MAX_RETRIES; intento++) {
    try {
      const msg = await client.messages.create({
        from,
        to,
        body: params.body,
      });

      console.log(
        `[twilio] sid=${msg.sid} status=${msg.status} to=${to} len=${params.body.length}`,
      );

      return { sid: msg.sid, status: msg.status };
    } catch (err) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      const retriable =
        !status || status >= 500 || (err as { code?: string })?.code === 'ETIMEDOUT';

      if (!retriable || intento === MAX_RETRIES - 1) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`[twilio] falló envío a ${to}: ${msg}`);
      }

      const backoffMs = 1000 * Math.pow(2, intento);
      console.warn(
        `[twilio] error status=${status} intento=${intento + 1}/${MAX_RETRIES}, reintentando en ${backoffMs}ms`,
      );
      await new Promise(r => setTimeout(r, backoffMs));
    }
  }

  throw lastError;
}
