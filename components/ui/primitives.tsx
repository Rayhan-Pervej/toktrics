'use client'

import { useId, useState, type ReactNode } from 'react'

export function Card({
  title,
  subtitle,
  actions,
  children,
  className = '',
  flush = false,
}: {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  flush?: boolean
}) {
  return (
    <section className={`rounded-xl border border-line bg-panel shadow-card ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-3">
          <div>
            {title && <h2 className="text-[15px] font-semibold">{title}</h2>}
            {subtitle && <p className="mt-1 text-[13px] text-dim">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={flush ? '' : 'px-5 pt-1 pb-5'}>{children}</div>
    </section>
  )
}

export function Disclosure({
  title,
  summary,
  children,
  defaultOpen = false,
}: {
  title: string
  summary?: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="rounded-xl border border-line bg-panel shadow-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span>
          <span className="block text-[15px] font-semibold">{title}</span>
          {summary && <span className="mt-0.5 block text-[13px] text-dim">{summary}</span>}
        </span>
        <span
          className={`shrink-0 text-faint transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {open && <div className="border-t border-line-soft px-5 py-4">{children}</div>}
    </section>
  )
}

// The label wraps only its own text: wrapping the control and hint too meant a
// click anywhere in the block, including the hint, focused the input.
export function Field({
  label,
  hint,
  value,
  children,
}: {
  label: string
  hint?: string
  value?: string
  children: ReactNode | ((id: string) => ReactNode)
}) {
  const id = useId()
  // Only a render-prop child claims the id, so anything else gets a plain label
  // rather than one pointing at an element that does not exist.
  const bound = typeof children === 'function'
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={bound ? id : undefined}
          className={`w-fit text-[13px] font-medium ${bound ? 'cursor-pointer' : ''}`}
        >
          {label}
        </label>
        {value && <span className="tabular text-[13px] font-semibold text-brand">{value}</span>}
      </div>
      {bound ? children(id) : children}
      {hint && <p className="mt-1.5 text-[13px] leading-relaxed text-faint">{hint}</p>}
    </div>
  )
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  suffix,
  id,
  label,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  id?: string
  label?: string
}) {
  // While focused the field holds raw text, so it can sit empty or mid-edit
  // without the committed value snapping back into it.
  const [draft, setDraft] = useState<string | null>(null)
  const shown = draft ?? (Number.isFinite(value) ? String(value) : '')

  const commit = (raw: string) => {
    setDraft(raw)
    if (raw.trim() === '') return
    const next = Number(raw)
    if (!Number.isFinite(next)) return
    if (next < min) return
    if (max !== undefined && next > max) return
    onChange(next)
  }

  return (
    <div className="mt-1.5 flex items-stretch overflow-hidden rounded-lg border border-line bg-panel transition-colors focus-within:border-brand">
      <input
        id={id}
        aria-label={label}
        type="number"
        className="tabular w-full bg-transparent px-3 py-2 text-sm outline-none"
        value={shown}
        min={min}
        max={max}
        step={step}
        onChange={(e) => commit(e.target.value)}
        onBlur={() => {
          const next = Number(draft)
          if (draft !== null && (draft.trim() === '' || !Number.isFinite(next))) onChange(min)
          setDraft(null)
        }}
      />
      {suffix && (
        <span className="flex shrink-0 items-center border-l border-line bg-raised px-2.5 text-xs text-faint">
          {suffix}
        </span>
      )}
    </div>
  )
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  format,
  id,
  label,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  format: (v: number) => string
  id?: string
  label?: string
}) {
  return (
    <div className="mt-1">
      <input
        id={id}
        aria-label={label}
        type="range"
        className="w-full"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-[11px] text-faint">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  hint?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-brand' : 'bg-line'
        }`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white shadow-card transition-transform ${
            checked ? 'translate-x-4.5' : 'translate-x-0.5'
          }`}
        />
      </button>
      <div className="min-w-0">
        <button type="button" onClick={() => onChange(!checked)} className="block text-left text-[13px] font-medium">
          {label}
        </button>
        {hint && <span className="mt-1 block text-[13px] leading-relaxed text-faint">{hint}</span>}
      </div>
    </div>
  )
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel px-4 py-3.5 shadow-card">
      <div className="eyebrow">{label}</div>
      <div className="tabular mt-1.5 text-xl font-semibold">{value}</div>
      {sub && <div className="mt-1 truncate text-[13px] text-dim">{sub}</div>}
    </div>
  )
}

export function Callout({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warn' }) {
  return (
    <p
      className={`rounded-lg px-3 py-2.5 text-[13px] leading-relaxed ${
        tone === 'warn' ? 'bg-raised text-dim' : 'bg-raised text-dim'
      }`}
    >
      {children}
    </p>
  )
}

export function Button({
  children,
  onClick,
  variant = 'secondary',
  size = 'md',
  disabled,
  title,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'secondary' | 'primary' | 'quiet'
  size?: 'md' | 'sm'
  disabled?: boolean
  title?: string
}) {
  const sizing = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-[13px]'
  const look =
    variant === 'primary'
      ? 'bg-brand text-white hover:brightness-110 shadow-card'
      : variant === 'quiet'
        ? 'text-dim hover:bg-raised hover:text-ink'
        : 'border border-line bg-panel text-ink hover:bg-raised shadow-card'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-lg font-medium transition-all disabled:opacity-40 ${sizing} ${look}`}
    >
      {children}
    </button>
  )
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; title?: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex rounded-lg border border-line bg-raised p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          title={o.title}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-all ${
            o.value === value ? 'bg-panel text-ink shadow-card' : 'text-dim hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
