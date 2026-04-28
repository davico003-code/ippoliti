export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ejecutarWriterDia } = await import(
      '@/agents/blog/writer/orquestador'
    );
    const result = await ejecutarWriterDia('viernes');
    return Response.json({ ...result, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('[blog-writer-viernes] Error:', err);
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    try {
      const { notificarConAlerta } = await import('@/agents/blog/lib/alert');
      await notificarConAlerta(
        `❌ writer-viernes: error fatal no capturado\n\n${errMsg}`,
        'writer-viernes: error-fatal',
      );
    } catch (alertErr) {
      console.error('[blog-writer-viernes] alerta también falló:', alertErr);
    }
    return Response.json({ error: errMsg }, { status: 500 });
  }
}
