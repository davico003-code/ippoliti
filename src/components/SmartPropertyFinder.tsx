'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowRight,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import {
  type SmartLifestyleNeed,
  type SmartObjective,
  type SmartProfile,
  type SmartPropertyType,
  smartProfileLabel,
} from '@/lib/property-fit'

const OBJECTIVES: Array<{ value: SmartObjective; label: string; description: string }> = [
  { value: 'vivir', label: 'Vivir', description: 'Prioriza comodidad y requisitos cotidianos.' },
  { value: 'invertir', label: 'Invertir', description: 'Prioriza precio, liquidez y margen.' },
  { value: 'oportunidad', label: 'Oportunidad', description: 'Busca el mejor valor contra mercado.' },
]

const TYPES: Array<{ value: SmartPropertyType; label: string }> = [
  { value: 'todos', label: 'Cualquiera' },
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'terreno', label: 'Terreno' },
]

const LOCATIONS: Array<{ value: SmartProfile['locations'][number]; label: string }> = [
  { value: 'funes', label: 'Funes' },
  { value: 'roldan', label: 'Roldán' },
  { value: 'rosario', label: 'Rosario' },
]

const NEEDS: Array<{ value: SmartLifestyleNeed; label: string }> = [
  { value: 'pileta', label: 'Pileta' },
  { value: 'verde', label: 'Jardín o verde' },
  { value: 'cochera', label: 'Cochera' },
  { value: 'seguridad', label: 'Barrio cerrado' },
  { value: 'lista', label: 'Lista para mudarse' },
]

type Props = {
  profile: SmartProfile
  active: boolean
  resultCount: number
  bestScore: number | null
  exactBudgetCount: number
  maxBudgetStretchPct: 0 | 5 | 10 | 15 | null
  onApply: (profile: SmartProfile) => void
  onClear: () => void
}

const numberOrNull = (value: string): number | null => {
  const parsed = Number(value.replace(/\D/g, ''))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function ChoiceButton({
  active,
  children,
  onClick,
  buttonRef,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
  buttonRef?: React.RefObject<HTMLButtonElement>
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 touch-manipulation rounded-xl border px-3.5 py-2.5 text-left text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#17613C]/25 ${
        active
          ? 'border-[#17613C] bg-[#EDF7F1] text-[#17613C]'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:text-gray-950'
      }`}
    >
      <span className="flex items-center gap-2">
        {active && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
        {children}
      </span>
    </button>
  )
}

export default function SmartPropertyFinder({
  profile,
  active,
  resultCount,
  bestScore,
  exactBudgetCount,
  maxBudgetStretchPct,
  onApply,
  onClear,
}: Props) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [draft, setDraft] = useState(profile)
  const [error, setError] = useState<string | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstChoiceRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    setDraft(profile)
    setError(null)
    const trigger = triggerRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => firstChoiceRef.current?.focus(), 0)

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
      if (event.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
      trigger?.focus()
    }
  }, [open, profile])

  const toggleLocation = (location: SmartProfile['locations'][number]) => {
    setDraft((current) => ({
      ...current,
      locations: current.locations.includes(location)
        ? current.locations.filter((item) => item !== location)
        : [...current.locations, location],
    }))
  }

  const toggleNeed = (need: SmartLifestyleNeed) => {
    setDraft((current) => ({
      ...current,
      needs: current.needs.includes(need)
        ? current.needs.filter((item) => item !== need)
        : [...current.needs, need],
    }))
  }

  const apply = (event: React.FormEvent) => {
    event.preventDefault()
    const hasUsefulCriterion =
      draft.locations.length > 0 ||
      draft.propertyType !== 'todos' ||
      draft.bedroomsMin != null ||
      draft.budgetMax != null ||
      draft.surfaceMin != null ||
      draft.needs.length > 0 ||
      draft.objective !== 'vivir'

    if (!hasUsefulCriterion) {
      setError('Elegí al menos una zona, un presupuesto o una característica importante.')
      return
    }
    onApply(draft)
    setOpen(false)
  }

  const priceStrategy = profile.budgetMax == null
    ? 'Nuevas para vos primero'
    : maxBudgetStretchPct == null || maxBudgetStretchPct === 0
      ? `${exactBudgetCount} dentro de tu presupuesto · nuevas primero`
      : `${exactBudgetCount} dentro de tu presupuesto · sumamos alternativas hasta +${maxBudgetStretchPct}%`

  return (
    <>
      <section
        className={`border-b px-3 py-3 sm:px-4 ${active ? 'border-[#CFE6D8] bg-[#F4FAF6]' : 'border-gray-100 bg-white'}`}
        aria-label="Selector experto de propiedades"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-[#17613C] text-white' : 'bg-[#EAF4EE] text-[#17613C]'}`}>
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-extrabold text-gray-950">
              {active ? `Tu selección SI · ${resultCount} ${resultCount === 1 ? 'opción' : 'opciones'}` : 'Que el buscador piense como vos'}
            </p>
            <p className="truncate text-[11.5px] font-medium text-gray-600">
              {active
                ? `${smartProfileLabel(profile)}${bestScore != null ? ` · mejor coincidencia ${bestScore}%` : ''}`
                : 'Contanos qué es imprescindible y qué aceptarías flexibilizar.'}
            </p>
          </div>
          {active && (
            <button
              type="button"
              onClick={onClear}
              className="hidden min-h-10 touch-manipulation items-center gap-1 rounded-lg px-2.5 text-[11.5px] font-bold text-gray-500 hover:bg-white hover:text-gray-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#17613C]/20 sm:flex"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Limpiar
            </button>
          )}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-11 shrink-0 touch-manipulation items-center gap-1.5 rounded-xl bg-[#17613C] px-3.5 text-[12px] font-extrabold text-white transition-colors hover:bg-[#124D30] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#17613C]/30"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {active ? 'Ajustar' : 'Personalizar'}
          </button>
        </div>
        {active && (
          <p className="mt-2 flex items-center gap-1.5 rounded-lg border border-[#DCEDE2] bg-white/80 px-2.5 py-1.5 text-[10.5px] font-bold leading-snug text-[#315C43]">
            <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{priceStrategy}. Cada diferencia aparece señalada.</span>
          </p>
        )}
      </section>

      {mounted && open && createPortal(
        <div
          className="fixed inset-0 z-[12000] flex items-end justify-center bg-black/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOpen(false)
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="smart-finder-title"
            className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[24px] bg-white shadow-2xl sm:max-h-[88dvh] sm:rounded-[24px]"
          >
            <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#17613C]">Selector experto SI</p>
                <h2 id="smart-finder-title" className="mt-1 text-balance text-[22px] font-extrabold leading-tight text-gray-950">
                  No buscamos “algo parecido”. Buscamos lo que tiene sentido para vos.
                </h2>
                <p className="mt-1 text-[13px] leading-relaxed text-gray-600">
                  Los requisitos filtran. Las preferencias ordenan. Si una opción exige una concesión, te la mostramos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar selector experto"
                className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#17613C]/25"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={apply} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
                <fieldset>
                  <legend className="mb-2.5 text-[14px] font-extrabold text-gray-950">¿Comprar o alquilar?</legend>
                  <div className="grid grid-cols-2 gap-2">
                    <ChoiceButton
                      buttonRef={firstChoiceRef}
                      active={draft.operation === 'venta'}
                      onClick={() => setDraft((current) => ({ ...current, operation: 'venta' }))}
                    >
                      Comprar
                    </ChoiceButton>
                    <ChoiceButton
                      active={draft.operation === 'alquiler'}
                      onClick={() => setDraft((current) => ({ ...current, operation: 'alquiler' }))}
                    >
                      Alquilar
                    </ChoiceButton>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-2.5 text-[14px] font-extrabold text-gray-950">¿Qué querés lograr?</legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {OBJECTIVES.map((item) => (
                      <ChoiceButton
                        key={item.value}
                        active={draft.objective === item.value}
                        onClick={() => setDraft((current) => ({ ...current, objective: item.value }))}
                      >
                        <span>
                          <span className="block">{item.label}</span>
                          <span className="mt-0.5 block text-[10.5px] font-medium leading-snug text-gray-500">{item.description}</span>
                        </span>
                      </ChoiceButton>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-2.5 text-[14px] font-extrabold text-gray-950">Zonas aceptables</legend>
                  <div className="flex flex-wrap gap-2">
                    {LOCATIONS.map((item) => (
                      <ChoiceButton key={item.value} active={draft.locations.includes(item.value)} onClick={() => toggleLocation(item.value)}>
                        {item.label}
                      </ChoiceButton>
                    ))}
                  </div>
                </fieldset>

                <div className="grid gap-5 sm:grid-cols-2">
                  <fieldset>
                    <legend className="mb-2.5 text-[14px] font-extrabold text-gray-950">Tipo de propiedad</legend>
                    <div className="flex flex-wrap gap-2">
                      {TYPES.map((item) => (
                        <ChoiceButton key={item.value} active={draft.propertyType === item.value} onClick={() => setDraft((current) => ({ ...current, propertyType: item.value }))}>
                          {item.label}
                        </ChoiceButton>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="mb-2.5 text-[14px] font-extrabold text-gray-950">Dormitorios mínimos</legend>
                    <div className="flex flex-wrap gap-2">
                      {[null, 1, 2, 3, 4].map((amount) => (
                        <ChoiceButton key={amount ?? 'any'} active={draft.bedroomsMin === amount} onClick={() => setDraft((current) => ({ ...current, bedroomsMin: amount }))}>
                          {amount == null ? 'Cualquiera' : `${amount}+`}
                        </ChoiceButton>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[14px] font-extrabold text-gray-950">Presupuesto máximo</span>
                    <span className="relative block">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-extrabold text-gray-500">USD</span>
                      <input
                        name="budget_max"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="Ej. 250.000…"
                        value={draft.budgetMax?.toLocaleString('es-AR') ?? ''}
                        onChange={(event) => setDraft((current) => ({ ...current, budgetMax: numberOrNull(event.target.value) }))}
                        className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-14 pr-3 text-[16px] font-semibold tabular-nums text-gray-950 focus:border-[#17613C] focus:outline-none focus:ring-4 focus:ring-[#17613C]/15"
                      />
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[14px] font-extrabold text-gray-950">Superficie total mínima</span>
                    <span className="relative block">
                      <input
                        name="surface_min"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="Ej. 150…"
                        value={draft.surfaceMin?.toLocaleString('es-AR') ?? ''}
                        onChange={(event) => setDraft((current) => ({ ...current, surfaceMin: numberOrNull(event.target.value) }))}
                        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-3 pr-12 text-[16px] font-semibold tabular-nums text-gray-950 focus:border-[#17613C] focus:outline-none focus:ring-4 focus:ring-[#17613C]/15"
                      />
                      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-gray-500">m²</span>
                    </span>
                  </label>
                </div>

                <fieldset>
                  <legend className="mb-2.5 text-[14px] font-extrabold text-gray-950">Lo que te cambia la experiencia</legend>
                  <div className="flex flex-wrap gap-2">
                    {NEEDS.map((item) => (
                      <ChoiceButton key={item.value} active={draft.needs.includes(item.value)} onClick={() => toggleNeed(item.value)}>
                        {item.label}
                      </ChoiceButton>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
                    Solo lo marcamos como coincidencia cuando la publicación aporta una señal concreta. No inventamos amenities faltantes.
                  </p>
                </fieldset>

                <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <input
                    type="checkbox"
                    name="flexible"
                    checked={draft.flexible}
                    onChange={(event) => setDraft((current) => ({ ...current, flexible: event.target.checked }))}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[#17613C]"
                  />
                  <span>
                    <span className="block text-[13px] font-extrabold text-gray-900">Mostrar oportunidades que justifiquen una pequeña concesión</span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-gray-600">Abrimos el precio por escalones de 5%, hasta un máximo de 15%, solamente si faltan opciones. Superficie: hasta 10% menos. Toda diferencia queda señalada.</span>
                  </span>
                </label>

                {error && (
                  <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-700">
                    {error}
                  </p>
                )}
              </div>

              <footer className="flex items-center gap-3 border-t border-gray-100 bg-white px-5 py-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] sm:px-6 sm:pb-4">
                {active && (
                  <button
                    type="button"
                    onClick={() => { onClear(); setOpen(false) }}
                    className="min-h-11 touch-manipulation rounded-xl px-3 text-[12px] font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-300"
                  >
                    Limpiar
                  </button>
                )}
                <button
                  type="submit"
                  className="ml-auto inline-flex min-h-12 flex-1 touch-manipulation items-center justify-center gap-2 rounded-xl bg-[#17613C] px-5 text-[14px] font-extrabold text-white hover:bg-[#124D30] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#17613C]/30 sm:flex-none"
                >
                  Armar mi selección <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </footer>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
