// Cron del generador de placas — corre Mar/Vie 11:05 UTC, 5 min después
// del blog-writer. Toma la última nota publicada, genera el carrusel
// completo y deja todo listo para aprobación en /admin/placas/{slug}.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { ejecutarOrquestador } = await import(
      '@/agents/placas/lib/orquestador'
    )
    const slugParam = new URL(req.url).searchParams.get('slug') ?? undefined
    const result = await ejecutarOrquestador({ slug: slugParam })
    const status = result.ok ? 200 : 500
    return Response.json(
      { ...result, timestamp: new Date().toISOString() },
      { status },
    )
  } catch (err) {
    console.error('[placas-generator] Error:', err)
    return Response.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
