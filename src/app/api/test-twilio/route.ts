import { enviarWhatsAppAdmin, getAdminNumber } from '@/agents/blog/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { mensaje?: string };
    const mensaje = body.mensaje ?? '🧪 Test de Twilio';

    await enviarWhatsAppAdmin(mensaje);

    return Response.json({
      ok: true,
      destino: getAdminNumber(),
      preview: mensaje.slice(0, 100),
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
