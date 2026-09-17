'use client'

import { useState } from 'react'
import { compactNumber } from '@/lib/format'

const STEPS = [1_000, 10_000, 100_000, 1_000_000]

export function VolumePicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
      <span className="eyebrow">Volume</span>
      <div className="inline-flex rounded-lg border border-line bg-raised p-0.5">
        {STEPS.map((step) => (
          <button
            key={step}
            type="button"
            onClick={() => onChange(step)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              value === step ? 'bg-panel text-ink shadow-card' : 'text-dim hover:text-ink'
            }`}
          >
            {compactNumber(step)}
          </button>
        ))}
      </div>
      <div className="flex items-stretch overflow-hidden rounded-lg border border-line bg-panel focus-within:border-brand">
        <input
          type="number"
          min={1}
          step={1000}
          value={draft ?? String(value)}
          onChange={(e) => {
            const raw = e.target.value
            setDraft(raw)
            const next = Number(raw)
            if (raw.trim() !== '' && Number.isFinite(next) && next > 0) onChange(Math.round(next))
          }}
          onBlur={() => setDraft(null)}
          className="tabular w-28 bg-transparent px-2.5 py-1 text-xs outline-none"
          aria-label="Messages per period"
        />
        <span className="flex items-center border-l border-line bg-raised px-2 text-xs text-faint">msgs</span>
      </div>
    </div>
  )
}
