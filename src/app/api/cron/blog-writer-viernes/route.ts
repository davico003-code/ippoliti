export const dynamic = 'force-dynamic';
export const maxDuration = 120;

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
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
