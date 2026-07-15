import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const componentSource = readFileSync(
  new URL('./PlanillaPrintable.tsx', import.meta.url),
  'utf8',
)

test('keeps the printable sheet visible inside the shared page template', () => {
  assert.doesNotMatch(
    componentSource,
    /main > \*:not\(\.planilla-page\)/,
    'the shared .si-page-enter wrapper must not be hidden',
  )
  assert.match(
    componentSource,
    /main > \.si-page-enter \{ display: contents !important; \}/,
    'the shared wrapper must preserve its printable children',
  )
})
