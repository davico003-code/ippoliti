export const dynamic = 'force-dynamic';
export const maxDuration = 120; // scraping + Claude call can take time

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { generarPropuestasSemanales } = await import(
      '@/agents/blog/radar/proponer-temas'
    );
    const { formatearPropuestasParaWhatsApp } = await import(
      '@/agents/blog/radar/formatear-whatsapp'
    );
    const { notificarConAlerta } = await import(
      '@/agents/blog/lib/alert'
    );

    const propuestas = await generarPropuestasSemanales();
    const mensaje = formatearPropuestasParaWhatsApp(propuestas);

    await notificarConAlerta(mensaje, 'blog-radar: propuestas semanales');

    return Response.json({
      success: true,
      propuestas: propuestas.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[blog-radar] Error:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
