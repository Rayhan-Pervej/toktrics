import { describe, expect, it } from 'vitest'
import { computeSensitivity } from './sensitivity'
import { pricePoint, tierResults } from './pricing'
import { bufferFor, estimateBuffer, measureSample, relativeCost } from './tokenizer/buffer'
import { CSA_ASSUMPTIONS, DEFAULT_TIERS } from './presets'
import { FIXTURE_FLASH_LITE, FIXTURE_MODELS } from './fixtures'
import { BUILTIN_MODELS, getModel } from './registry'
import { compareModels, computeCost } from './cost'

const flashLite = FIXTURE_FLASH_LITE
const base = CSA_ASSUMPTIONS
const rows = computeSensitivity(base, flashLite, FIXTURE_MODELS)
const row = (id: string) => rows.find((r) => r.id === id)

describe('sensitivity', () => {
  it('sorts by absolute impact', () => {
    const magnitudes = rows.map((r) => Math.abs(r.deltaPct))
    expect(magnitudes).toEqual([...magnitudes].sort((a, b) => b - a))
  })

  it('reproduces the documented 1080p uplift', () => {
    expect(row('upscale-image')!.deltaPct).toBeCloseTo(12.8, 1)
  })

  it('reproduces the documented buffer removal', () => {
    expect(row('remove-buffer')!.deltaPct).toBeCloseTo(-20.7, 1)
  })

  it('reproduces the documented image-rate doubling', () => {
    expect(row('double-image-rate')!.deltaPct).toBeCloseTo(6.4, 1)
  })

  // A model with low headline rates can still cost more once images and history
  // are priced in, so the swap must never be offered as a saving when it is not one.
  it('only suggests a model swap that actually costs less', () => {
    for (const model of BUILTIN_MODELS) {
      const swap = computeSensitivity(base, model, BUILTIN_MODELS).find((r) => r.id === 'cheaper-model')
      if (swap) expect(swap.deltaPct).toBeLessThan(0)
    }
  })

  it('offers no swap when already on the cheapest model', () => {
    const cheapest = compareModels(base, BUILTIN_MODELS)[0]
    const model = getModel(BUILTIN_MODELS, cheapest.modelId)!
    const rows = computeSensitivity(base, model, BUILTIN_MODELS)
    expect(rows.find((r) => r.id === 'cheaper-model')).toBeUndefined()
  })

  it('omits levers that do not apply', () => {
    expect(row('downscale-image')).toBeUndefined()
    const noImages = computeSensitivity({ ...base, imagesEnabled: false }, flashLite, FIXTURE_MODELS)
    expect(noImages.find((r) => r.id === 'drop-images-history')).toBeUndefined()
  })
})

describe('pricing', () => {
  const cost = computeCost(base, flashLite).costPerMessage

  it('matches the documented margin at $0.003', () => {
    const p = pricePoint(0.003, cost)
    expect(p.grossMarginPct).toBeCloseTo(54.8, 1)
    expect(p.costCoverage).toBeCloseTo(2.2, 1)
  })

  it('matches the documented margin at $0.002', () => {
    expect(pricePoint(0.002, cost).grossMarginPct).toBeCloseTo(32.2, 1)
  })

  it('computes tier revenue and margin', () => {
    const tiers = tierResults(DEFAULT_TIERS, 0.003, cost)
    expect(tiers[0].revenue).toBeCloseTo(9, 2)
    expect(tiers[2].revenue).toBeCloseTo(150, 2)
    expect(tiers[2].cost).toBeCloseTo(67.8, 1)
  })

})

describe('language buffer estimation', () => {
  const english = measureSample('English', 'Hello, when will my order arrive? I paid yesterday evening.', 13)
  const bangla = measureSample('Bangla', 'আমার অর্ডারটা কবে আসবে? আমি কালকে পেমেন্ট করেছি।', 19)
  const chinese = measureSample('Chinese', '我的订单什么时候到？我昨天晚上已经付款了。', 12)

  it('measures characters per token across writing systems', () => {
    expect(english.charsPerToken).toBeCloseTo(4.54, 2)
    expect(bangla.charsPerToken).toBeCloseTo(2.53, 2)
  })

  it('takes the worst language as the buffer', () => {
    const estimate = estimateBuffer([english, bangla, chinese])
    expect(estimate.reference).toBe(english)
    expect(estimate.suggestedBuffer).toBeCloseTo(19 / 13, 3)
  })

  // Chinese packs a word into one character, so it can undercut English.
  it('never suggests a buffer below 1', () => {
    expect(estimateBuffer([english, chinese]).suggestedBuffer).toBe(1)
    expect(relativeCost(chinese, english)).toBeLessThan(1)
  })

  it('handles empty input', () => {
    expect(estimateBuffer([]).suggestedBuffer).toBe(1)
  })

  it('prices for the chosen language', () => {
    const all = [english, bangla, chinese]
    expect(bufferFor(all, 'English')).toBe(1)
    expect(bufferFor(all, 'Bangla')).toBeCloseTo(19 / 13, 3)
    expect(bufferFor(all, null)).toBeCloseTo(19 / 13, 3)
  })

  // Chinese undercuts English here, and a buffer below 1 would understate cost.
  it('never prices a language below the baseline', () => {
    expect(bufferFor([english, chinese], 'Chinese')).toBe(1)
  })
})
