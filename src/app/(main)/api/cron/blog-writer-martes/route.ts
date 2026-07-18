import { isCronAuthorized } from '@/lib/cron-auth'
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ejecutarWriterDia } = await import(
      '@/agents/blog/writer/orquestador'
    );
    const result = await ejecutarWriterDia('martes');
    return Response.json({ ...result, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('[blog-writer-martes] Error:', err);
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    try {
      const { registrarActividad } = await import('@/agents/blog/lib/actividad');
      await registrarActividad({
        tipo: 'error',
        mensaje: `writer-martes: error fatal no capturado. ${errMsg}`,
      });
    } catch (alertErr) {
      console.error('[blog-writer-martes] feed de actividad también falló:', alertErr);
    }
    return Response.json({ error: errMsg }, { status: 500 });
  }
}
