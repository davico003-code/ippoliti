// Backfill de portadas IA para el blog: recorre las notas publicadas y les
// genera una portada única vía el endpoint /api/admin/notas/generar-imagen
// (que a su vez usa OpenAI + Blob + override en Redis).
//
// Corre contra el deploy (preview o prod), NO contra localhost, porque la
// generación necesita OPENAI_API_KEY y los tokens del Blob/Redis de Vercel.
//
// Uso:
//   SI_TEAM_CODE=xxx node scripts/backfill-blog-imagenes.mjs [opciones]
//
// Opciones:
//   --base <url>        Base del sitio (default https://siinmobiliaria.com)
//   --limit <n>         Máximo de notas a procesar en esta corrida (default 5,
//                       pensado para validar el estilo en tandas chicas)
//   --incluir-estaticas También regenera las notas estáticas (que ya tienen
//                       foto curada de stock). Default: solo dinámicas.
//   --dry               Lista qué haría sin generar nada.
//
// Es idempotente: saltea las notas que ya tienen override (portada propia,
// subida o generada) y las eliminadas. Para regenerar una portada puntual,
// usar el botón ✦ en /admin/notas.

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const flag = (name) => args.includes(`--${name}`);

const BASE = (opt('base', 'https://siinmobiliaria.com') || '').replace(/\/$/, '');
const LIMIT = Number(opt('limit', '5'));
const INCLUIR_ESTATICAS = flag('incluir-estaticas');
const DRY = flag('dry');
const CODE = process.env.SI_TEAM_CODE || opt('code', '');

if (!CODE) {
  console.error('Falta SI_TEAM_CODE en el entorno (o --code <código>).');
  process.exit(1);
}

const headers = { 'x-team-code': CODE, 'Content-Type': 'application/json' };

async function main() {
  const res = await fetch(`${BASE}/api/admin/notas/list`, { headers });
  if (!res.ok) {
    console.error(`No se pudo listar notas: HTTP ${res.status}`);
    process.exit(1);
  }
  const { items } = await res.json();

  const pendientes = items.filter(
    (n) =>
      !n.eliminada &&
      !n.override &&
      (INCLUIR_ESTATICAS || n.tipo === 'dinamica'),
  );

  console.log(
    `${items.length} notas totales · ${pendientes.length} sin portada propia` +
      `${INCLUIR_ESTATICAS ? '' : ' (solo dinámicas)'} · procesando ${Math.min(LIMIT, pendientes.length)}`,
  );

  const tanda = pendientes.slice(0, LIMIT);
  let ok = 0;
  let fail = 0;

  for (const [i, n] of tanda.entries()) {
    const tag = `[${i + 1}/${tanda.length}] ${n.slug}`;
    if (DRY) {
      console.log(`${tag} (dry: se generaría)`);
      continue;
    }
    try {
      const r = await fetch(`${BASE}/api/admin/notas/generar-imagen`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ slug: n.slug }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.url) {
        ok++;
        console.log(`${tag} ✓ ${d.url}`);
      } else {
        fail++;
        console.warn(`${tag} ✗ HTTP ${r.status}: ${d.error ?? 'sin detalle'}`);
      }
    } catch (e) {
      fail++;
      console.warn(`${tag} ✗ ${e.message}`);
    }
    // Pausa corta entre generaciones para no saturar rate limits de OpenAI.
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\nListo: ${ok} generadas, ${fail} con error, ${pendientes.length - tanda.length} pendientes para próximas tandas.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
