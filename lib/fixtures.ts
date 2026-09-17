import type { Model } from './types'

// The rates COST.md was priced on in September 2026. Pinned so the golden-master
// tests keep checking the arithmetic rather than the current price list.
const geminiTiles = { strategy: 'gemini-tiles' as const, tileSize: 768, tokensPerTile: 258 }

export const FIXTURE_FLASH_LITE: Model = {
  id: 'fixture-flash-lite',
  name: 'Flash Lite fixture',
  provider: 'fixture',
  inputRatePerM: 0.25,
  outputRatePerM: 1.5,
  image: geminiTiles,
  cache: { writeMultiplier: 1.25, readMultiplier: 0.1 },
  batchDiscount: 0.5,
  vision: true,
  builtin: true,
}

export const FIXTURE_FLASH: Model = {
  ...FIXTURE_FLASH_LITE,
  id: 'fixture-flash',
  name: 'Flash fixture',
  inputRatePerM: 1.5,
  outputRatePerM: 9,
}

export const FIXTURE_DEEPSEEK: Model = {
  ...FIXTURE_FLASH_LITE,
  id: 'fixture-deepseek',
  name: 'DeepSeek fixture',
  inputRatePerM: 0.089,
  outputRatePerM: 0.177,
  image: { strategy: 'flat', flatTokens: 384 },
}

export const FIXTURE_MODELS = [FIXTURE_FLASH_LITE, FIXTURE_FLASH, FIXTURE_DEEPSEEK]
