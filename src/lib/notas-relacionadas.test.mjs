import assert from 'node:assert/strict'
import test from 'node:test'
import { notasRelacionadas } from './notas-relacionadas.ts'

const nota = (slug, cat) => ({ slug, cat })
const cat = (p) => p.cat
const NOTAS = [nota('a1', 'A'), nota('b1', 'B'), nota('a2', 'A'), nota('a3', 'A'), nota('b2', 'B'), nota('a4', 'A'), nota('a5', 'A'), nota('c1', 'C')]

test('la siguiente del blog y las siguientes de su categoría, en ronda', () => {
  // a1 → la siguiente del blog es b1; de su categoría, a2 y a3.
  assert.deepEqual(notasRelacionadas('a1', NOTAS, cat).map((p) => p.slug), ['a2', 'a3', 'b1'])
  // a4 → la siguiente del blog (a5) ya es de su categoría: entran a5, a1 y a2.
  assert.deepEqual(notasRelacionadas('a4', NOTAS, cat).map((p) => p.slug), ['a5', 'a1', 'a2'])
})

test('si la categoría no alcanza, completa con las siguientes del blog', () => {
  assert.deepEqual(notasRelacionadas('b1', NOTAS, cat).map((p) => p.slug), ['b2', 'a2', 'a3'])
  assert.deepEqual(notasRelacionadas('c1', NOTAS, cat).map((p) => p.slug), ['a1', 'b1', 'a2'])
})

test('nunca se linkea a sí misma y todas reciben al menos un link', () => {
  const recibidos = new Map()
  for (const p of NOTAS) {
    const rel = notasRelacionadas(p.slug, NOTAS, cat)
    assert.equal(rel.length, 3)
    assert.ok(!rel.some((r) => r.slug === p.slug))
    for (const r of rel) recibidos.set(r.slug, (recibidos.get(r.slug) ?? 0) + 1)
  }
  for (const p of NOTAS) assert.ok((recibidos.get(p.slug) ?? 0) >= 1, `${p.slug} sin links`)
})
