import type { CostResult, Model } from '../types'

const escape = (v: string | number): string => {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(rows: (string | number)[][]): string {
  return rows.map((r) => r.map(escape).join(',')).join('\n')
}

export function costResultsToCsv(results: CostResult[], models: Model[], volume = 10_000): string {
  const rows: (string | number)[][] = [
    ['Model', 'Provider', 'Input $/M', 'Output $/M', 'Input tokens', 'Output tokens', 'Cost per message', `Cost per ${volume}`],
  ]
  for (const r of results) {
    const m = models.find((x) => x.id === r.modelId)
    if (!m) continue
    rows.push([
      m.name,
      m.provider,
      m.inputRatePerM,
      m.outputRatePerM,
      r.breakdown.totalInputTokens.toFixed(1),
      r.breakdown.outputBuffered.toFixed(1),
      r.costPerMessage.toFixed(8),
      (r.costPerMessage * volume).toFixed(4),
    ])
  }
  return toCsv(rows)
}

export function download(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
