import assert from 'node:assert/strict'
import test from 'node:test'

import { findPropertySection } from './propertySectionTarget.ts'

test('prioriza la sección visible dentro del panel sobre un id duplicado oculto', () => {
  const hiddenMobileSection = { source: 'mobile-hidden' }
  const visiblePanelSection = { source: 'desktop-panel' }
  const selectors = []

  const panelRoot = {
    querySelector(selector) {
      selectors.push(selector)
      return visiblePanelSection
    },
  }
  const documentRoot = {
    getElementById() {
      return hiddenMobileSection
    },
  }

  assert.equal(
    findPropertySection('ubicacion', panelRoot, documentRoot),
    visiblePanelSection,
  )
  assert.deepEqual(selectors, ['[id="ubicacion"]'])
})

test('usa el documento cuando la ficha no vive dentro de un panel', () => {
  const pageSection = { source: 'full-page' }
  const documentRoot = {
    getElementById() {
      return pageSection
    },
  }

  assert.equal(findPropertySection('resumen', null, documentRoot), pageSection)
})
