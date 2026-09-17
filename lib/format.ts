export function usd(value: number, minDigits = 2): string {
  if (!Number.isFinite(value)) return '–'
  const digits = Math.abs(value) < 1 && value !== 0 ? 6 : minDigits
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function tokens(value: number): string {
  if (!Number.isFinite(value)) return '–'
  const rounded = Math.abs(value) < 10 ? Math.round(value * 10) / 10 : Math.round(value)
  return rounded.toLocaleString('en-US')
}

export function percent(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return '–'
  return `${value.toFixed(digits)}%`
}

export function signedPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '–'
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}%`
}

export function multiple(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '–'
  return `${value.toFixed(digits)}x`
}

export function compactNumber(value: number): string {
  return value.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 })
}
