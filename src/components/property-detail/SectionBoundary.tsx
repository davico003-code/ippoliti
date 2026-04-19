'use client'

// Local error boundary — renders null when a section throws so a single
// broken section doesn't kill the whole ficha (e.g. a Leaflet init failure,
// an Overpass fetch edge case, etc.). Silent by default; logs to console.
import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  name?: string
  fallback?: ReactNode
}
interface State { hasError: boolean }

export default class SectionBoundary extends Component<Props, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError(): State { return { hasError: true } }
  componentDidCatch(err: Error) {
    console.error(`[SectionBoundary:${this.props.name ?? 'section'}] error:`, err.message)
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}
