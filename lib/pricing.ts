import type { PricePoint, Tier, TierResult } from './types'

export function pricePoint(pricePerMessage: number, costPerMessage: number): PricePoint {
  const grossMarginPct = pricePerMessage === 0 ? 0 : ((pricePerMessage - costPerMessage) / pricePerMessage) * 100
  return {
    pricePerMessage,
    grossMarginPct,
    costCoverage: costPerMessage === 0 ? Infinity : pricePerMessage / costPerMessage,
    revenue1k: pricePerMessage * 1_000,
    revenue10k: pricePerMessage * 10_000,
    revenue100k: pricePerMessage * 100_000,
  }
}

export function pricePoints(prices: number[], costPerMessage: number): PricePoint[] {
  return prices.map((p) => pricePoint(p, costPerMessage))
}

export function tierResults(tiers: Tier[], pricePerMessage: number, costPerMessage: number): TierResult[] {
  return tiers.map((t) => {
    const revenue = t.messagesPerMonth * pricePerMessage
    const cost = t.messagesPerMonth * costPerMessage
    return {
      ...t,
      revenue,
      cost,
      margin: revenue - cost,
      marginPct: revenue === 0 ? 0 : ((revenue - cost) / revenue) * 100,
    }
  })
}


// Price points derived from cost, since a fixed ladder makes no sense when cost
// spans two orders of magnitude across models.
export function priceLadder(costPerMessage: number): number[] {
  if (costPerMessage <= 0) return [0.001, 0.002, 0.005, 0.01]
  const margins = [0.3, 0.5, 0.65, 0.8]
  const seen = new Set<number>()
  for (const m of margins) seen.add(roundPrice(costPerMessage / (1 - m)))
  return [...seen].sort((a, b) => a - b)
}

// Round to something a human would actually quote.
function roundPrice(value: number): number {
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10]
  const scaled = value / magnitude
  const step = steps.find((s) => s >= scaled) ?? 10
  return Number((step * magnitude).toPrecision(2))
}
