import { isCronAuthorized } from '@/lib/cron-auth'
export const dynamic = 'force-dynamic';
export const maxDuration = 120; // scraping + Claude call can take time

// Radar autónomo (jun-2026): el cron del lunes solo LLENA la cola de temas
// (blog:temas_semana). Ya no hay aprobación humana ni WhatsApp: el writer de
// martes/viernes auto-selecciona de esa cola. El resultado queda en el feed
// de actividad del panel admin, no por WhatsApp.

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { generarPropuestasSemanales } = await import(
      '@/agents/blog/radar/proponer-temas'
    );
    const { registrarActividad } = await import('@/agents/blog/lib/actividad');

    const propuestas = await generarPropuestasSemanales();

    await registrarActividad({
      tipo: 'info',
      mensaje: `Radar del lunes: ${propuestas.length} tema(s) frescos cargados en la cola. El writer publica martes y viernes.`,
    });

    return Response.json({
      success: true,
      propuestas: propuestas.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[blog-radar] Error:', err);
    try {
      const { registrarActividad } = await import('@/agents/blog/lib/actividad');
      await registrarActividad({
        tipo: 'error',
        mensaje: `Radar del lunes: error al generar propuestas. ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    } catch {
      /* el feed es best-effort */
    }
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
