'use client'

import { useEffect, useId, useRef, useState } from 'react'

export interface SelectOption {
  value: string
  label: string
  hint?: string
}

// Native <option> lists are drawn by the OS and ignore page styling, so the open
// menu is built here instead.
export function Select({
  value,
  onChange,
  options,
  id,
  label,
  className = '',
}: {
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  id?: string
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selected = options.find((o) => o.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const commit = (v: string) => {
    onChange(v)
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return setOpen(false)
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (open) commit(options[active].value)
      else {
        setActive(Math.max(0, options.findIndex((o) => o.value === value)))
        setOpen(true)
      }
      return
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) {
        setActive(Math.max(0, options.findIndex((o) => o.value === value)))
        return setOpen(true)
      }
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive((i) => (i + step + options.length) % options.length)
    }
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={label}
        onClick={() => {
          setActive(Math.max(0, options.findIndex((o) => o.value === value)))
          setOpen(!open)
        }}
        onKeyDown={onKeyDown}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-line bg-panel px-3 py-2 text-left text-[13px] text-ink shadow-card transition-colors hover:border-faint focus:border-brand focus:outline-none"
      >
        <span className="truncate">
          {selected?.label}
          {selected?.hint && <span className="text-faint"> · {selected.hint}</span>}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 text-faint transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-line bg-panel py-1 shadow-lift"
        >
          {options.map((o, i) => {
            const isSelected = o.value === value
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => commit(o.value)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left text-[13px] transition-colors ${
                    i === active ? 'bg-raised' : ''
                  } ${isSelected ? 'font-medium text-brand' : 'text-ink'}`}
                >
                  <span className="truncate">
                    {o.label}
                    {o.hint && <span className="text-faint"> · {o.hint}</span>}
                  </span>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
                      <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
