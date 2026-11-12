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

test('prints on a single A4 sheet with the brand fonts', () => {
  assert.match(
    componentSource,
    /@page \{ size: A4; margin: 0; \}/,
    'the sheet carries its own padding; browser margins would push the footer to page 2',
  )
  assert.doesNotMatch(
    componentSource,
    /font-family: '(Raleway|Poppins)'/,
    'next/font exposes the brand fonts as --font-raleway / --font-poppins, not by literal name',
  )
})
