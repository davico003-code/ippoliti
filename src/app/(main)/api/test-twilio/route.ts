import { enviarWhatsAppAdmin } from '@/agents/blog/lib/whatsapp';
import { assertTeamCode } from '@/lib/team-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Gate de equipo: sin esto, cualquiera podía disparar WhatsApp pago al admin
  // (costo Twilio + spam) y la respuesta filtraba el número del admin.
  const denied = assertTeamCode(req);
  if (denied) return denied;

  try {
    const body = (await req.json().catch(() => ({}))) as { mensaje?: string };
    const mensaje = body.mensaje ?? '🧪 Test de Twilio';

    await enviarWhatsAppAdmin(mensaje);

    return Response.json({ ok: true, preview: mensaje.slice(0, 100) });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
