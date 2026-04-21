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
    const { notificarCarruselListo, notificarCarruselFallido } = await import(
      '@/agents/placas/lib/notificar-admin'
    )
    const slugParam = new URL(req.url).searchParams.get('slug') ?? undefined
    const result = await ejecutarOrquestador({ slug: slugParam })

    if (result.ok) {
      await notificarCarruselListo({
        slug: result.slug,
        titulo: result.titulo,
        total: result.total,
        ms_total: result.ms_total,
        intentos_extractor: result.intentos_extractor,
      })
    } else {
      await notificarCarruselFallido(result.slug, result.error)
    }

    const status = result.ok ? 200 : 500
    return Response.json(
      { ...result, timestamp: new Date().toISOString() },
      { status },
    )
  } catch (err) {
    console.error('[placas-generator] Error:', err)
    const { notificarCarruselFallido } = await import(
      '@/agents/placas/lib/notificar-admin'
    )
    const msg = err instanceof Error ? err.message : 'Unknown error'
    await notificarCarruselFallido(undefined, msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
