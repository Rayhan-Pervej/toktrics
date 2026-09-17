'use client'

import { signedPercent, usd } from '@/lib/format'
import type { SensitivityRow } from '@/lib/sensitivity'

export function SensitivityPanel({ rows }: { rows: SensitivityRow[] }) {
  if (rows.length === 0) {
    return <p className="text-[13px] text-dim">No levers apply to the current assumptions.</p>
  }

  const widest = Math.max(...rows.map((r) => Math.abs(r.deltaPct)))

  return (
    <ul className="space-y-3.5">
      {rows.map((r) => {
        const saves = r.deltaAbs < 0
        const width = widest === 0 ? 0 : (Math.abs(r.deltaPct) / widest) * 100

        return (
          <li key={r.id}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-medium">{r.label}</span>
              <span className={`tabular text-[13px] font-semibold ${saves ? 'text-down' : 'text-up'}`}>
                {signedPercent(r.deltaPct)}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line-soft">
              <div
                className={`h-full rounded-full ${saves ? 'bg-down' : 'bg-up'}`}
                style={{ width: `${Math.max(2, width)}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between gap-3 text-[13px] text-dim">
              <span>{r.detail}</span>
              <span className="tabular shrink-0">{usd(r.leverCost)}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
