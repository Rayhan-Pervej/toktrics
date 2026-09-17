export type ImageStrategy = 'gemini-tiles' | 'openai-patches' | 'flat' | 'none'

export type ModelTier = 'frontier' | 'mid' | 'cheap'

export interface ImageTokenizer {
  strategy: ImageStrategy
  tileSize?: number
  tokensPerTile?: number
  patchSize?: number
  maxTokens?: number
  flatTokens?: number
}

export interface CacheRates {
  writeMultiplier: number
  readMultiplier: number
}

export interface Model {
  id: string
  name: string
  provider: string
  inputRatePerM: number
  outputRatePerM: number
  image: ImageTokenizer
  cache?: CacheRates
  batchDiscount?: number
  ratesVerified?: string
  tier?: ModelTier
  vision: boolean
  builtin: boolean
  note?: string
}

export interface Assumptions {
  sessionLength: number
  systemPromptTokens: number
  userMessageTokens: number
  ragChunkCount: number
  ragChunkTokens: number
  replyTokens: number
  toolTokens: number
  languageBuffer: number
  bufferEnabled: boolean
  imagesEnabled: boolean
  imageWidth: number
  imageHeight: number
  imageRate: number
  resendImagesInHistory: boolean
  cacheSystemPrompt: boolean
  batchMode: boolean
  overheadPerMessage: number
}

export interface TokenBreakdown {
  avgHistoryTokens: number
  ragTokens: number
  textInputRaw: number
  textInputBuffered: number
  cachedWriteTokens: number
  cachedReadTokens: number
  uncachedTextTokens: number
  tokensPerImage: number
  avgImageBillings: number
  imageTokens: number
  totalInputTokens: number
  outputRaw: number
  outputBuffered: number
}

export interface CostResult {
  modelId: string
  breakdown: TokenBreakdown
  inputCost: number
  outputCost: number
  overheadCost: number
  costPerMessage: number
  costPer1k: number
  costPer10k: number
  costPer100k: number
}

export type StepUnit = 'tokens' | 'usd' | 'x' | 'count'

export interface DerivationStep {
  label: string
  formula: string
  value: number
  unit: StepUnit
  emphasis?: boolean
}

export interface Preset {
  id: string
  name: string
  description: string
  defaultModelId: string
  assumptions: Assumptions
}

export interface Scenario {
  id: string
  name: string
  modelId: string
  assumptions: Assumptions
  savedAt: string
}

export interface PricePoint {
  pricePerMessage: number
  grossMarginPct: number
  costCoverage: number
  revenue1k: number
  revenue10k: number
  revenue100k: number
}

export interface Tier {
  name: string
  messagesPerMonth: number
}

export interface TierResult extends Tier {
  revenue: number
  cost: number
  margin: number
  marginPct: number
}
