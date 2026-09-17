import type { Assumptions, CostResult, DerivationStep, Model, TokenBreakdown } from './types'
import { describeImageStrategy, tokensPerImage } from './images'

export function effectiveBuffer(a: Assumptions): number {
  return a.bufferEnabled ? a.languageBuffer : 1
}

export function avgHistoryTokens(a: Assumptions): number {
  const perFinishedMessage = a.userMessageTokens + a.replyTokens
  const n = Math.max(1, a.sessionLength)
  let total = 0
  for (let i = 0; i < n; i++) total += i * perFinishedMessage
  return total / n
}

// An image is resent on every later turn, and its arrival turn is unknown,
// so this is the mean billing count over all possible arrival positions.
export function avgImageBillings(a: Assumptions): number {
  if (!a.resendImagesInHistory) return 1
  const n = Math.max(1, a.sessionLength)
  let total = 0
  for (let i = 1; i <= n; i++) total += n - i + 1
  return total / n
}

export function computeBreakdown(a: Assumptions, model: Model): TokenBreakdown {
  const buffer = effectiveBuffer(a)
  const ragTokens = a.ragChunkCount * a.ragChunkTokens
  const avgHistory = avgHistoryTokens(a)

  const textInputRaw = a.systemPromptTokens + a.userMessageTokens + ragTokens + avgHistory
  const textInputBuffered = textInputRaw * buffer

  const bufferedSystemPrompt = a.systemPromptTokens * buffer
  const canCache = a.cacheSystemPrompt && model.cache !== undefined
  const n = Math.max(1, a.sessionLength)

  // Cached prompt is written once per session and read on every later turn.
  const cachedWriteTokens = canCache ? bufferedSystemPrompt / n : 0
  const cachedReadTokens = canCache ? (bufferedSystemPrompt * (n - 1)) / n : 0
  const uncachedTextTokens = canCache ? textInputBuffered - bufferedSystemPrompt : textInputBuffered

  const perImage = a.imagesEnabled ? tokensPerImage(model.image, a.imageWidth, a.imageHeight) : 0
  const billings = avgImageBillings(a)
  const imageTokens = a.imagesEnabled ? perImage * billings * a.imageRate : 0

  const outputRaw = a.replyTokens + a.toolTokens
  const outputBuffered = outputRaw * buffer

  return {
    avgHistoryTokens: avgHistory,
    ragTokens,
    textInputRaw,
    textInputBuffered,
    cachedWriteTokens,
    cachedReadTokens,
    uncachedTextTokens,
    tokensPerImage: perImage,
    avgImageBillings: billings,
    imageTokens,
    totalInputTokens: textInputBuffered + imageTokens,
    outputRaw,
    outputBuffered,
  }
}

export function computeCost(a: Assumptions, model: Model): CostResult {
  const b = computeBreakdown(a, model)
  const discount = a.batchMode ? 1 - (model.batchDiscount ?? 0) : 1

  const inputRate = model.inputRatePerM / 1_000_000
  const outputRate = model.outputRatePerM / 1_000_000
  const cache = model.cache

  const billedInput =
    b.uncachedTextTokens +
    b.imageTokens +
    (cache ? b.cachedWriteTokens * cache.writeMultiplier + b.cachedReadTokens * cache.readMultiplier : 0)

  const inputCost = billedInput * inputRate * discount
  const outputCost = b.outputBuffered * outputRate * discount
  const overheadCost = a.overheadPerMessage
  const costPerMessage = inputCost + outputCost + overheadCost

  return {
    modelId: model.id,
    breakdown: b,
    inputCost,
    outputCost,
    overheadCost,
    costPerMessage,
    costPer1k: costPerMessage * 1_000,
    costPer10k: costPerMessage * 10_000,
    costPer100k: costPerMessage * 100_000,
  }
}

export function compareModels(a: Assumptions, models: Model[]): CostResult[] {
  return models.map((m) => computeCost(a, m)).sort((x, y) => x.costPerMessage - y.costPerMessage)
}

export function explainCost(a: Assumptions, model: Model): DerivationStep[] {
  const b = computeBreakdown(a, model)
  const buffer = effectiveBuffer(a)
  const n = Math.max(1, a.sessionLength)
  const result = computeCost(a, model)
  const steps: DerivationStep[] = []

  steps.push({
    label: 'System prompt + tools',
    formula: 'fixed, sent every call',
    value: a.systemPromptTokens,
    unit: 'tokens',
  })
  steps.push({
    label: 'User message',
    formula: 'one message',
    value: a.userMessageTokens,
    unit: 'tokens',
  })
  steps.push({
    label: 'RAG chunks',
    formula: `${a.ragChunkCount} x ${a.ragChunkTokens}, retrieved each call`,
    value: b.ragTokens,
    unit: 'tokens',
  })
  steps.push({
    label: 'Conversation history',
    formula: `${a.userMessageTokens + a.replyTokens} per finished message, averaged over ${n} positions`,
    value: b.avgHistoryTokens,
    unit: 'tokens',
  })
  steps.push({
    label: 'Text input subtotal',
    formula: 'sum of the above',
    value: b.textInputRaw,
    unit: 'tokens',
  })

  if (a.bufferEnabled) {
    steps.push({
      label: 'Language buffer',
      formula: `${b.textInputRaw.toFixed(1)} x ${buffer}`,
      value: b.textInputBuffered,
      unit: 'tokens',
      emphasis: true,
    })
  }

  if (a.imagesEnabled && b.tokensPerImage > 0) {
    steps.push({
      label: 'One image',
      formula: describeImageStrategy(model.image, a.imageWidth, a.imageHeight),
      value: b.tokensPerImage,
      unit: 'tokens',
    })
    steps.push({
      label: 'Times billed per session',
      formula: a.resendImagesInHistory
        ? `mean over ${n} arrival positions`
        : 'dropped from history after answering',
      value: b.avgImageBillings,
      unit: 'x',
    })
    steps.push({
      label: 'Image, amortised',
      formula: `${b.tokensPerImage} x ${b.avgImageBillings} x ${a.imageRate} image rate`,
      value: b.imageTokens,
      unit: 'tokens',
    })
  }

  steps.push({
    label: 'Total input',
    formula: 'text + images',
    value: b.totalInputTokens,
    unit: 'tokens',
    emphasis: true,
  })

  steps.push({
    label: 'Output',
    formula: a.bufferEnabled
      ? `(${a.replyTokens} reply + ${a.toolTokens} tool) x ${buffer}`
      : `${a.replyTokens} reply + ${a.toolTokens} tool`,
    value: b.outputBuffered,
    unit: 'tokens',
    emphasis: true,
  })

  if (a.cacheSystemPrompt && model.cache) {
    steps.push({
      label: 'Cache write, amortised',
      formula: `${(a.systemPromptTokens * buffer).toFixed(0)} / ${n} turns at ${model.cache.writeMultiplier}x`,
      value: b.cachedWriteTokens,
      unit: 'tokens',
    })
    steps.push({
      label: 'Cache read, amortised',
      formula: `${n - 1} of ${n} turns at ${model.cache.readMultiplier}x`,
      value: b.cachedReadTokens,
      unit: 'tokens',
    })
  }

  steps.push({
    label: 'Input cost',
    formula: `billed input at $${model.inputRatePerM}/M`,
    value: result.inputCost,
    unit: 'usd',
  })
  steps.push({
    label: 'Output cost',
    formula: `${b.outputBuffered.toFixed(0)} at $${model.outputRatePerM}/M`,
    value: result.outputCost,
    unit: 'usd',
  })
  steps.push({
    label: 'Overhead',
    formula: 'embedding, vector search, compute',
    value: result.overheadCost,
    unit: 'usd',
  })
  steps.push({
    label: 'Cost per message',
    formula: 'input + output + overhead',
    value: result.costPerMessage,
    unit: 'usd',
    emphasis: true,
  })

  return steps
}
