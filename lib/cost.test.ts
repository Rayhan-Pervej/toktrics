import { describe, expect, it } from 'vitest'
import { avgHistoryTokens, avgImageBillings, computeBreakdown, computeCost } from './cost'
import { tokensPerImage } from './images'
import { CSA_ASSUMPTIONS, EMPTY_ASSUMPTIONS } from './presets'
import { FIXTURE_DEEPSEEK as deepseek, FIXTURE_FLASH as flash, FIXTURE_FLASH_LITE as flashLite } from './fixtures'
import type { Assumptions } from './types'

const base = CSA_ASSUMPTIONS

const at = (o: Partial<Assumptions>): Assumptions => ({ ...base, ...o })
const p1080 = { imageWidth: 1920, imageHeight: 1080 }

describe('COST.md golden master', () => {
  it('averages history over session positions', () => {
    expect(avgHistoryTokens(base)).toBe(507.5)
  })

  it('bills an image 4.5 times on average across 8 turns', () => {
    expect(avgImageBillings(base)).toBe(4.5)
  })

  it('derives the documented token budget', () => {
    const b = computeBreakdown(base, flashLite)
    expect(b.ragTokens).toBe(1536)
    expect(b.textInputRaw).toBe(2668.5)
    expect(Math.round(b.textInputBuffered)).toBe(3469)
    expect(Math.round(b.imageTokens)).toBe(348)
    expect(Math.round(b.totalInputTokens)).toBe(3817)
    expect(b.outputBuffered).toBe(234)
  })

  it('matches published per-message costs', () => {
    expect(computeCost(base, flashLite).costPerMessage).toBeCloseTo(0.001356, 6)
    expect(computeCost(at(p1080), flashLite).costPerMessage).toBeCloseTo(0.00153, 6)
    expect(computeCost(base, flash).costPerMessage).toBeCloseTo(0.007883, 6)
  })

  it('matches the no-buffer figure', () => {
    const cost = computeCost(at({ bufferEnabled: false }), flashLite).costPerMessage
    expect(cost).toBeCloseTo(0.001075, 6)
  })

  it('charges DeepSeek a flat image rate regardless of resolution', () => {
    const a = computeCost(base, deepseek).costPerMessage
    const b = computeCost(at(p1080), deepseek).costPerMessage
    expect(a).toBeCloseTo(b, 9)
    expect(a).toBeCloseTo(0.000424, 6)
  })

  // COST.md prints 135.62 by rounding per-message to 6dp before scaling; we keep full precision.
  it('scales volumes linearly', () => {
    const r = computeCost(base, flashLite)
    expect(r.costPer1k).toBeCloseTo(1.356, 3)
    expect(r.costPer100k).toBeCloseTo(135.634, 2)
    expect(r.costPer100k).toBeCloseTo(r.costPerMessage * 100_000, 9)
  })
})

describe('image tokenization', () => {
  const gemini = { strategy: 'gemini-tiles' as const, tileSize: 768, tokensPerTile: 258 }
  const openai = { strategy: 'openai-patches' as const, patchSize: 32, maxTokens: 1536 }

  it('tiles Gemini images', () => {
    expect(tokensPerImage(gemini, 1280, 720)).toBe(516)
    expect(tokensPerImage(gemini, 1920, 1080)).toBe(1548)
    expect(tokensPerImage(gemini, 512, 512)).toBe(258)
  })

  it('caps OpenAI patches', () => {
    expect(tokensPerImage(openai, 1280, 720)).toBe(920)
    expect(tokensPerImage(openai, 1920, 1080)).toBe(1536)
    expect(tokensPerImage(openai, 3840, 2160)).toBe(1536)
  })

  it('returns zero for absent dimensions', () => {
    expect(tokensPerImage(gemini, 0, 0)).toBe(0)
  })
})

describe('levers', () => {
  it('drops image cost when images leave history', () => {
    const kept = computeCost(base, flashLite).costPerMessage
    const dropped = computeCost(at({ resendImagesInHistory: false }), flashLite).costPerMessage
    expect(dropped).toBeLessThan(kept)
    expect(computeBreakdown(at({ resendImagesInHistory: false }), flashLite).avgImageBillings).toBe(1)
  })

  it('raises cost with longer sessions', () => {
    expect(computeCost(at({ sessionLength: 15 }), flashLite).costPerMessage).toBeGreaterThan(
      computeCost(base, flashLite).costPerMessage,
    )
  })

  it('saves roughly a tenth by caching the system prompt', () => {
    const plain = computeCost(base, flashLite).costPerMessage
    const cached = computeCost(at({ cacheSystemPrompt: true }), flashLite).costPerMessage
    const saving = 1 - cached / plain
    expect(saving).toBeGreaterThan(0.08)
    expect(saving).toBeLessThan(0.15)
  })

  it('halves cost in batch mode', () => {
    const plain = computeCost(base, flashLite)
    const batch = computeCost(at({ batchMode: true }), flashLite)
    const modelCostPlain = plain.inputCost + plain.outputCost
    const modelCostBatch = batch.inputCost + batch.outputCost
    expect(modelCostBatch).toBeCloseTo(modelCostPlain * 0.5, 9)
  })

  it('ignores images when disabled', () => {
    expect(computeBreakdown(at({ imagesEnabled: false }), flashLite).imageTokens).toBe(0)
  })
})

describe('empty assumptions', () => {
  it('costs nothing and stays finite', () => {
    const r = computeCost(EMPTY_ASSUMPTIONS, flashLite)
    expect(r.costPerMessage).toBe(0)
    expect(Number.isFinite(r.breakdown.totalInputTokens)).toBe(true)
    expect(Number.isFinite(r.breakdown.avgHistoryTokens)).toBe(true)
    expect(r.breakdown.avgHistoryTokens).toBe(0)
  })

  it('produces no NaN anywhere in the breakdown', () => {
    const b = computeCost(EMPTY_ASSUMPTIONS, flashLite).breakdown
    for (const [key, value] of Object.entries(b)) {
      expect(Number.isFinite(value), `${key} is ${value}`).toBe(true)
    }
  })
})
