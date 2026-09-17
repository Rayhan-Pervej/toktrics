'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/primitives'
import { compactNumber, multiple, percent, usd } from '@/lib/format'
import { priceLadder, pricePoints, tierResults } from '@/lib/pricing'
import { DEFAULT_TIERS } from '@/lib/presets'

export function PricingPanel({ costPerMessage, volume }: { costPerMessage: number; volume: number }) {
  // Prices follow the selected model, so the table never opens on a loss.
  const ladder = useMemo(() => priceLadder(costPerMessage), [costPerMessage])
  const [extra, setExtra] = useState<number[]>([])
  const [picked, setPicked] = useState<number | null>(null)
  const [draft, setDraft] = useState('')

  const prices = useMemo(
    () => [...new Set([...ladder, ...extra])].sort((a, b) => a - b),
    [ladder, extra],
  )
  const chosen = picked !== null && prices.includes(picked) ? picked : (ladder[1] ?? ladder[0])

  const points = pricePoints(prices, costPerMessage)
  const tiers = tierResults(DEFAULT_TIERS, chosen, costPerMessage)

  const addPrice = () => {
    const value = Number(draft)
    if (!Number.isFinite(value) || value <= 0) return
    setExtra((e) => [...new Set([...e, value])])
    setPicked(value)
    setDraft('')
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-dim">
            Only relevant if you resell this. Pick a price to see what margin it leaves over the{' '}
            {usd(costPerMessage)} cost.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-stretch overflow-hidden rounded-lg border border-line bg-panel focus-within:border-brand">
              <span className="flex items-center pl-2.5 text-xs text-faint">$</span>
              <input
                type="number"
                min={0}
                step={0.001}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPrice()}
                placeholder="0.010"
                aria-label="Add your own price per message"
                className="tabular w-24 bg-transparent px-1.5 py-1 text-xs outline-none"
              />
            </div>
            <Button size="sm" onClick={addPrice} disabled={draft.trim() === ''}>
              Add price
            </Button>
          </div>
        </div>

        <div className="scroll-x">
          <table className="w-full min-w-[440px] border-collapse">
            <thead>
              <tr>
                <th className="eyebrow px-3 pb-2 text-left font-medium">Price</th>
                <th className="eyebrow px-3 pb-2 text-right font-medium">Margin</th>
                <th className="eyebrow px-3 pb-2 text-right font-medium">Covers cost</th>
                <th className="eyebrow px-3 pb-2 text-right font-medium">
                  Revenue per {compactNumber(volume)}
                </th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => {
                const thin = p.grossMarginPct < 40
                const active = p.pricePerMessage === chosen
                return (
                  <tr
                    key={p.pricePerMessage}
                    onClick={() => setPicked(p.pricePerMessage)}
                    className={`row-pick ${active ? 'is-selected' : ''}`}
                  >
                    <td
                      className={`tabular px-3 py-3 text-[13px] font-semibold ${
                        active ? 'text-brand' : ''
                      }`}
                    >
                      {usd(p.pricePerMessage)}
                    </td>
                    <td className={`tabular px-3 py-3 text-right text-[13px] ${thin ? 'text-up' : 'text-down'}`}>
                      {percent(p.grossMarginPct)}
                    </td>
                    <td className="tabular px-3 py-3 text-right text-[13px] text-dim">
                      {multiple(p.costCoverage)}
                    </td>
                    <td className="tabular px-3 py-3 text-right text-[13px] text-dim">
                      {usd(p.pricePerMessage * volume)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-medium">Monthly volumes at {usd(chosen)}</p>
        <div className="scroll-x">
          <table className="w-full min-w-[400px] border-collapse">
            <thead>
              <tr>
                <th className="eyebrow px-3 pb-2 text-left font-medium">Volume</th>
                <th className="eyebrow px-3 pb-2 text-right font-medium">Messages</th>
                <th className="eyebrow px-3 pb-2 text-right font-medium">Revenue</th>
                <th className="eyebrow px-3 pb-2 text-right font-medium">Cost</th>
                <th className="eyebrow px-3 pb-2 text-right font-medium">Margin</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((t) => (
                <tr key={t.name} className="border-b border-line-soft last:border-0">
                  <td className="px-3 py-2.5 text-[13px] font-medium">{t.name}</td>
                  <td className="tabular px-3 py-2.5 text-right text-[13px] text-dim">
                    {t.messagesPerMonth.toLocaleString('en-US')}
                  </td>
                  <td className="tabular px-3 py-2.5 text-right text-[13px]">{usd(t.revenue)}</td>
                  <td className="tabular px-3 py-2.5 text-right text-[13px] text-dim">{usd(t.cost)}</td>
                  <td className="tabular px-3 py-2.5 text-right text-[13px] font-medium text-down">
                    {usd(t.margin)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
