'use client'

import { Card } from '@/components/ui/primitives'
import { VolumePicker } from './VolumePicker'
import { compactNumber, usd } from '@/lib/format'
import type { CostResult, Model } from '@/lib/types'

export function CostTable({
  results,
  models,
  selectedId,
  onSelect,
  volume,
  onVolumeChange,
}: {
  results: CostResult[]
  models: Model[]
  selectedId: string
  onSelect: (id: string) => void
  volume: number
  onVolumeChange: (v: number) => void
}) {
  const dearest = results[results.length - 1]?.costPerMessage ?? 1
  const cheapest = results[0]?.costPerMessage ?? 0
  const spread = cheapest === 0 ? 1 : dearest / cheapest

  return (
    <Card
      title="Compare models"
      subtitle="Same assumptions, every model. Click one to select it."
      actions={<VolumePicker value={volume} onChange={onVolumeChange} />}
      flush
    >
      <div className="scroll-x pb-3">
        <table className="w-full border-collapse sm:min-w-[560px]">
          <thead>
            <tr>
              <th className="eyebrow px-3 pb-2 text-left font-medium">Model</th>
              <th className="eyebrow px-3 pb-2 text-right font-medium">Per message</th>
              <th className="eyebrow hidden px-3 pb-2 text-right font-medium sm:table-cell">Per {compactNumber(volume)}</th>
              <th className="eyebrow hidden w-36 px-3 pb-2 text-left font-medium sm:table-cell">vs cheapest</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => {
              const model = models.find((m) => m.id === r.modelId)
              if (!model) return null
              const selected = r.modelId === selectedId
              const multiple = cheapest === 0 ? 1 : r.costPerMessage / cheapest
              // Log scale: the range routinely spans 75x, which flattens a linear bar to nothing.
              const width = spread <= 1 ? 100 : (Math.log(multiple) / Math.log(spread)) * 92 + 8

              return (
                <tr
                  key={r.modelId}
                  onClick={() => onSelect(r.modelId)}
                  className={`row-pick ${selected ? 'is-selected' : ''}`}
                >
                  <td className="px-3 py-2.5">
                    <div className={`text-sm font-medium ${selected ? 'text-brand' : ''}`}>{model.name}</div>
                    <div className="mt-1 text-[13px] text-dim">
                      {model.provider} · ${model.inputRatePerM} in / ${model.outputRatePerM} out
                    </div>
                    <div className="tabular mt-1.5 text-[13px] text-dim sm:hidden">
                      {usd(r.costPerMessage * volume)} per {compactNumber(volume)}
                      {multiple > 1.01 ? ` · ${multiple.toFixed(1)}x` : ' · cheapest'}
                    </div>
                  </td>
                  <td
                    className={`tabular px-3 py-2.5 text-right align-top text-sm font-semibold whitespace-nowrap ${
                      selected ? 'text-brand' : ''
                    }`}
                  >
                    {usd(r.costPerMessage)}
                  </td>
                  <td className="tabular hidden px-3 py-2.5 text-right text-sm text-dim sm:table-cell">
                    {usd(r.costPerMessage * volume)}
                  </td>
                  <td className="hidden px-3 py-2.5 sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-soft">
                        <div
                          className={`h-full rounded-full ${selected ? 'bg-brand' : 'bg-line'}`}
                          style={{ width: `${Math.min(100, Math.max(4, width))}%` }}
                        />
                      </div>
                      <span className="tabular w-10 shrink-0 text-right text-[13px] text-dim">
                        {multiple === 1 ? 'base' : `${multiple.toFixed(multiple < 10 ? 1 : 0)}x`}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
