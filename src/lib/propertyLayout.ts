import type { TokkoProperty } from './tokko'

export type LayoutBlock =
  | { type: 'featured'; property: TokkoProperty }
  | { type: 'grid'; properties: TokkoProperty[] }

export function buildPropertyLayout(properties: TokkoProperty[], gridSize = 6): LayoutBlock[] {
  const featured: TokkoProperty[] = []
  const simple: TokkoProperty[] = []

  for (const p of properties) {
    if (p.is_starred_on_web) featured.push(p)
    else simple.push(p)
  }

  const blocks: LayoutBlock[] = []
  let featIdx = 0
  let simpIdx = 0

  while (simpIdx < simple.length || featIdx < featured.length) {
    // Insert a featured if available
    if (featIdx < featured.length) {
      blocks.push({ type: 'featured', property: featured[featIdx] })
      featIdx++
    }

    // Insert a grid chunk
    const chunk = simple.slice(simpIdx, simpIdx + gridSize)
    if (chunk.length > 0) {
      blocks.push({ type: 'grid', properties: chunk })
      simpIdx += gridSize
    }

    // If no featured left and no simple left, stop
    if (featIdx >= featured.length && simpIdx >= simple.length) break
    // If no featured left but simple remain, flush them
    if (featIdx >= featured.length && simpIdx < simple.length) {
      blocks.push({ type: 'grid', properties: simple.slice(simpIdx) })
      break
    }
  }

  return blocks
}
