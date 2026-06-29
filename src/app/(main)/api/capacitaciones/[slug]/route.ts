// Sirve y guarda las presentaciones de Capacitaciones (SI School).
//
// GET  → devuelve el HTML: la versión editada (Vercel Blob) si existe, si no
//        el archivo estático de public/. Para admins inyecta un editor inline
//        (editar texto / borrar bloques / guardar).
// POST → guarda el HTML editado en Blob (solo admin). El cliente manda el
//        documento ya limpio (sin la barra ni el script del editor).

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { list, put } from '@vercel/blob'
import { verifyAgentToken } from '@/lib/auth'
import { CAPACITACIONES } from '@/components/si-school/capacitaciones'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const blobPath = (id: string) => `capacitaciones-edit/${id}.html`

async function isAdmin(): Promise<boolean> {
  const token = cookies().get('si_agent_token')?.value
  if (!token) return false
  const agent = await verifyAgentToken(token)
  return agent?.role === 'admin'
}

async function readEdited(id: string): Promise<string | null> {
  try {
    const path = blobPath(id)
    const result = await list({ prefix: path })
    const match = result.blobs.find((b) => b.pathname === path)
    if (!match) return null
    const res = await fetch(match.url, { cache: 'no-store' })
    return res.ok ? await res.text() : null
  } catch {
    return null
  }
}

function editorHtml(id: string): string {
  const btn =
    'font-family:system-ui,sans-serif;font-size:13px;font-weight:600;border-radius:8px;padding:8px 12px;cursor:pointer;border:1px solid #d8d2c6;background:#fff;color:#1A5C38'
  return `
<div id="__capedit" style="position:fixed;top:12px;right:12px;z-index:2147483647;display:flex;gap:8px">
  <button id="__capedit_toggle" style="${btn}">✏️ Editar</button>
  <button id="__capedit_del" style="display:none;${btn};border-color:#E0A0A0;color:#A32D2D">🗑 Borrar bloque: OFF</button>
  <button id="__capedit_save" style="display:none;${btn};background:#1A5C38;color:#fff;border-color:#1A5C38">Guardar</button>
  <button id="__capedit_cancel" style="display:none;${btn}">Cancelar</button>
</div>
<script id="__capedit_script">
(function(){
  var ID=${JSON.stringify(id)};
  var editing=false, del=false;
  var bar=document.getElementById('__capedit');
  var T=document.getElementById('__capedit_toggle');
  var D=document.getElementById('__capedit_del');
  var S=document.getElementById('__capedit_save');
  var C=document.getElementById('__capedit_cancel');
  function setEditing(on){
    editing=on;
    document.body.setAttribute('contenteditable', on?'true':'false');
    T.style.display=on?'none':''; D.style.display=on?'':'none';
    S.style.display=on?'':'none'; C.style.display=on?'':'none';
    if(!on) setDel(false);
  }
  function setDel(on){ del=on; D.textContent= on?'🗑 Borrar bloque: ON':'🗑 Borrar bloque: OFF'; document.body.style.cursor= on?'crosshair':''; }
  T.onclick=function(){ setEditing(true); };
  C.onclick=function(){ if(confirm('¿Descartar los cambios sin guardar?')) location.reload(); };
  D.onclick=function(){ setDel(!del); };
  document.addEventListener('click', function(e){
    if(!editing||!del) return;
    if(bar.contains(e.target)) return;
    e.preventDefault(); e.stopPropagation();
    var b=e.target.closest('section,article,figure,table,li,.card,.slide,p,h1,h2,h3,h4');
    if(!b||b===document.body) b=e.target;
    if(b && b!==document.body && confirm('¿Eliminar este bloque?')) b.remove();
  }, true);
  S.onclick=async function(){
    S.disabled=true; S.textContent='Guardando…';
    var clone=document.documentElement.cloneNode(true);
    ['#__capedit','#__capedit_script'].forEach(function(sel){ var n=clone.querySelector(sel); if(n) n.remove(); });
    var body=clone.querySelector('body'); if(body){ body.removeAttribute('contenteditable'); body.style.cursor=''; }
    var html='<!DOCTYPE html>\\n'+clone.outerHTML;
    try{
      var res=await fetch('/api/capacitaciones/'+ID, {method:'POST', headers:{'content-type':'text/html'}, body:html});
      if(res.ok){ S.textContent='Guardado ✓'; setTimeout(function(){ location.reload(); }, 600); }
      else { alert('No se pudo guardar (¿sesión admin?).'); S.disabled=false; S.textContent='Guardar'; }
    }catch(err){ alert('Error de red al guardar.'); S.disabled=false; S.textContent='Guardar'; }
  };
})();
</script>`
}

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const cap = CAPACITACIONES.find((c) => c.id === params.slug)
  if (!cap) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

  // Base: versión editada (Blob) o el estático de public/.
  let html = await readEdited(cap.id)
  if (html == null) {
    const origin = new URL(req.url).origin
    const res = await fetch(`${origin}${cap.src}`, { cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ error: 'Fuente no disponible' }, { status: 502 })
    html = await res.text()
  }

  // Inyectar editor solo para admin.
  if (await isAdmin()) {
    const editor = editorHtml(cap.id)
    const i = html.lastIndexOf('</body>')
    html = i >= 0 ? html.slice(0, i) + editor + html.slice(i) : html + editor
  }

  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  })
}

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const cap = CAPACITACIONES.find((c) => c.id === params.slug)
  if (!cap) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const html = await req.text()
  if (!html || html.length < 100) {
    return NextResponse.json({ error: 'HTML inválido' }, { status: 400 })
  }

  try {
    await put(blobPath(cap.id), html, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'text/html; charset=utf-8',
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error guardando' }, { status: 500 })
  }
}
