import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.REVALIDATE_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as { slug?: string };

  revalidatePath('/blog');
  if (body.slug) {
    revalidatePath(`/blog/${body.slug}`);
  }

  return Response.json({ revalidated: true, slug: body.slug ?? null });
}
