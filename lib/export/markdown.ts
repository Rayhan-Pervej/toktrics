import { compareModels, computeBreakdown, explainCost } from '../cost'
import { computeSensitivity } from '../sensitivity'
import { priceLadder, pricePoints, tierResults } from '../pricing'
import { DEFAULT_TIERS } from '../presets'
import { multiple, percent, tokens, usd } from '../format'
import type { Assumptions, Model } from '../types'

export function toMarkdown(
  a: Assumptions,
  model: Model,
  allModels: Model[],
  title = 'Cost model',
  volume = 10_000,
): string {
  const b = computeBreakdown(a, model)
  const results = compareModels(a, allModels)
  const mine = results.find((r) => r.modelId === model.id)!
  const steps = explainCost(a, model)
  const levers = computeSensitivity(a, model, allModels)
  const points = pricePoints(priceLadder(mine.costPerMessage), mine.costPerMessage)
  const today = new Date().toISOString().slice(0, 10)

  const lines: string[] = []
  lines.push(`# ${title}`, '')
  lines.push(`Generated ${today} with toktrics. Priced on **${model.name}**.`, '')

  lines.push('## Assumptions', '')
  lines.push('| Parameter | Value |', '|:----------|------:|')
  lines.push(`| Session length | ${a.sessionLength} messages |`)
  lines.push(`| System prompt + tools | ${a.systemPromptTokens} tokens |`)
  lines.push(`| User message | ${a.userMessageTokens} tokens |`)
  lines.push(`| RAG retrieval | ${a.ragChunkCount} x ${a.ragChunkTokens} = ${b.ragTokens} |`)
  lines.push(`| Agent reply | ${a.replyTokens} tokens |`)
  lines.push(`| Tool call output | ${a.toolTokens} tokens |`)
  if (a.bufferEnabled) lines.push(`| Language buffer | ${a.languageBuffer}x on text |`)
  if (a.imagesEnabled) {
    lines.push(`| Image resolution | ${a.imageWidth}x${a.imageHeight} |`)
    lines.push(`| Messages carrying an image | ${(a.imageRate * 100).toFixed(0)}% |`)
    lines.push(`| Images resent in history | ${a.resendImagesInHistory ? 'yes' : 'no'} |`)
  }
  if (a.cacheSystemPrompt) lines.push('| Prompt caching | enabled |')
  if (a.batchMode) lines.push('| Batch pricing | enabled |')
  lines.push(`| Non-model overhead | ${usd(a.overheadPerMessage)} per message |`, '')

  lines.push('## Token budget per message', '')
  lines.push('| Component | Tokens |', '|:----------|-------:|')
  lines.push(`| System prompt + tools | ${tokens(a.systemPromptTokens)} |`)
  lines.push(`| User message | ${tokens(a.userMessageTokens)} |`)
  lines.push(`| RAG chunks | ${tokens(b.ragTokens)} |`)
  lines.push(`| Conversation history | ${tokens(b.avgHistoryTokens)} |`)
  lines.push(`| **Text input** | **${tokens(b.textInputRaw)}** |`)
  if (a.bufferEnabled) lines.push(`| With language buffer | **${tokens(b.textInputBuffered)}** |`)
  if (a.imagesEnabled && b.tokensPerImage > 0) {
    lines.push(`| One image | ${tokens(b.tokensPerImage)} |`)
    lines.push(`| Billed ${b.avgImageBillings}x, at ${(a.imageRate * 100).toFixed(0)}% of messages | ${tokens(b.imageTokens)} |`)
  }
  lines.push(`| **Total input** | **${tokens(b.totalInputTokens)}** |`)
  lines.push(`| **Output** | **${tokens(b.outputBuffered)}** |`, '')

  lines.push('## Cost per message', '')
  lines.push(
    `| Model | Per message | ${volume.toLocaleString('en-US')} msg |`,
    '|:------|------------:|------------:|',
  )
  for (const r of results) {
    const m = allModels.find((x) => x.id === r.modelId)
    if (!m) continue
    const mark = r.modelId === model.id ? '**' : ''
    lines.push(`| ${mark}${m.name}${mark} | ${usd(r.costPerMessage)} | ${usd(r.costPerMessage * volume)} |`)
  }
  lines.push('')

  lines.push('### How this row is calculated', '')
  lines.push('| Step | Formula | Value |', '|:-----|:--------|------:|')
  for (const s of steps) {
    const value = s.unit === 'usd' ? usd(s.value) : s.unit === 'x' ? multiple(s.value) : tokens(s.value)
    lines.push(`| ${s.label} | ${s.formula} | ${value} |`)
  }
  lines.push('')

  lines.push('## If you are charging for this', '')
  lines.push('| Price per message | Gross margin | Cost coverage |', '|:------------------|-------------:|--------------:|')
  for (const p of points) {
    lines.push(`| ${usd(p.pricePerMessage)} | ${percent(p.grossMarginPct)} | ${multiple(p.costCoverage)} |`)
  }
  lines.push('')

  const mid = points[Math.min(1, points.length - 1)]
  lines.push(`### Monthly volumes at ${usd(mid.pricePerMessage)}`, '')
  lines.push('| Tier | Messages/month | Revenue | Cost | Margin |', '|:-----|---------------:|--------:|-----:|-------:|')
  for (const t of tierResults(DEFAULT_TIERS, mid.pricePerMessage, mine.costPerMessage)) {
    lines.push(
      `| ${t.name} | ${t.messagesPerMonth.toLocaleString('en-US')} | ${usd(t.revenue)} | ${usd(t.cost)} | ${usd(t.margin)} |`,
    )
  }
  lines.push('')

  if (levers.length > 0) {
    lines.push('## What changes the cost most', '')
    for (const l of levers) {
      const dir = l.deltaAbs < 0 ? 'cuts' : 'raises'
      lines.push(`- **${l.label}.** ${dir} cost to ${usd(l.leverCost)} (${l.deltaPct >= 0 ? '+' : ''}${l.deltaPct.toFixed(1)}%). ${l.detail}`)
    }
    lines.push('')
  }

  lines.push('## Limits', '')
  lines.push('- Token figures are modelled assumptions, not measurements from production traffic.')
  lines.push(`- Rates as configured in the model registry${model.ratesVerified ? `, verified ${model.ratesVerified}` : ''}. Verify against the provider before quoting.`)
  lines.push('- Excludes any human handling cost.')

  return lines.join('\n')
}
