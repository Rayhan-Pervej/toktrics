import { describe, expect, it } from 'vitest'
import { pricePoint, priceLadder } from './pricing'

describe('price ladder', () => {
  it('never opens on a loss, whatever the model costs', () => {
    for (const cost of [0.000038, 0.001356, 0.00485, 0.02425, 0.1]) {
      for (const price of priceLadder(cost)) {
        expect(pricePoint(price, cost).grossMarginPct, `price ${price} at cost ${cost}`).toBeGreaterThan(0)
      }
    }
  })

  it('spans a useful range of margins', () => {
    const cost = 0.00485
    const margins = priceLadder(cost).map((p) => pricePoint(p, cost).grossMarginPct)
    expect(Math.min(...margins)).toBeGreaterThan(20)
    expect(Math.max(...margins)).toBeGreaterThan(70)
  })

  it('returns round numbers a person would quote', () => {
    expect(priceLadder(0.00485)).toEqual([0.0075, 0.01, 0.015, 0.025])
  })

  it('handles a zero cost without dividing by it', () => {
    expect(priceLadder(0).every((p) => p > 0)).toBe(true)
  })
})
