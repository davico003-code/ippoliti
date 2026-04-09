import { createElement, type ReactNode } from 'react'

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function highlightMatch(text: string, query: string): ReactNode {
  if (!query.trim()) return text

  const words = query.split(/\s+/).filter(Boolean).map(w => escapeRegex(normalize(w)))
  if (words.length === 0) return text

  const pattern = new RegExp(`(${words.join('|')})`, 'gi')
  const normalized = normalize(text)

  // Find all match ranges in the normalized string
  const ranges: [number, number][] = []
  let match: RegExpExecArray | null
  while ((match = pattern.exec(normalized)) !== null) {
    ranges.push([match.index, match.index + match[0].length])
  }

  if (ranges.length === 0) return text

  // Merge overlapping ranges
  const merged: [number, number][] = [ranges[0]]
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1]
    if (ranges[i][0] <= last[1]) {
      last[1] = Math.max(last[1], ranges[i][1])
    } else {
      merged.push(ranges[i])
    }
  }

  // Build segments using original text characters
  const parts: ReactNode[] = []
  let cursor = 0
  for (let i = 0; i < merged.length; i++) {
    const [start, end] = merged[i]
    if (cursor < start) {
      parts.push(text.slice(cursor, start))
    }
    parts.push(createElement('strong', { key: i, style: { fontWeight: 700 } }, text.slice(start, end)))
    cursor = end
  }
  if (cursor < text.length) {
    parts.push(text.slice(cursor))
  }

  return parts
}
