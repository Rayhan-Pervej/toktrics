'use client'

import { multiple, tokens, usd } from '@/lib/format'
import type { DerivationStep } from '@/lib/types'

function renderValue(step: DerivationStep): string {
  switch (step.unit) {
    case 'usd':
      return usd(step.value)
    case 'x':
      return multiple(step.value)
    case 'count':
      return String(step.value)
    default:
      return tokens(step.value)
  }
}

export function BreakdownView({ steps, modelName }: { steps: DerivationStep[]; modelName: string }) {
  return (
    <>
      <p className="mb-3 text-[13px] text-dim">Priced on {modelName}</p>
      <ol>
        {steps.map((step, i) => (
          <li
            key={`${step.label}-${i}`}
            className={`flex items-baseline justify-between gap-4 border-b border-line-soft py-2 last:border-0 ${
              step.emphasis ? 'font-semibold' : ''
            }`}
          >
            <div className="min-w-0">
              <div className="text-[13px]">{step.label}</div>
              <div className="truncate text-xs text-dim">{step.formula}</div>
            </div>
            <div className={`tabular shrink-0 text-[13px] ${step.emphasis ? 'text-brand' : 'text-dim'}`}>
              {renderValue(step)}
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}
