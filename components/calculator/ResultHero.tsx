'use client'

import { compactNumber, tokens, usd } from '@/lib/format'
import type { CostResult, Model } from '@/lib/types'

export function ResultHero({
  result,
  model,
  volume,
  sessionLength,
}: {
  result: CostResult
  model: Model
  volume: number
  sessionLength: number
}) {
  const b = result.breakdown

  return (
    <div className="fade-up rounded-2xl border border-line bg-panel p-6 shadow-lift sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-6">
        <div>
          <div className="eyebrow">Cost per message</div>
          <div className="tabular mt-2 text-5xl leading-none font-semibold tracking-tight sm:text-6xl">
            {usd(result.costPerMessage)}
          </div>
          <p className="mt-3 text-sm text-dim">
            on <span className="font-medium text-ink">{model.name}</span>
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 sm:gap-x-10">
          <div>
            <dt className="eyebrow">Per {compactNumber(volume)} messages</dt>
            <dd className="tabular mt-1.5 text-lg font-semibold">{usd(result.costPerMessage * volume)}</dd>
          </div>
          <div>
            <dt className="eyebrow">Per conversation</dt>
            <dd className="tabular mt-1.5 text-lg font-semibold">{usd(result.costPerMessage * sessionLength)}</dd>
          </div>
          <div>
            <dt className="eyebrow">Input tokens</dt>
            <dd className="tabular mt-1.5 text-lg font-semibold">{tokens(b.totalInputTokens)}</dd>
          </div>
          <div>
            <dt className="eyebrow">Output tokens</dt>
            <dd className="tabular mt-1.5 text-lg font-semibold">{tokens(b.outputBuffered)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
