'use client'

import { useMemo, useState } from 'react'
import { Button, Callout, Card, Field, NumberInput } from '@/components/ui/primitives'
import { useModelRegistry } from '@/hooks/useModelRegistry'
import {
  blankModel,
  comparedParam,
  DEFAULT_COMPARED,
  RATES_NOTE,
  RATES_VERIFIED,
  TIER_LABELS,
  validateModel,
} from '@/lib/registry'
import { Select } from '@/components/ui/Select'
import { useAssumptions } from '@/hooks/useAssumptions'
import { tokensPerImage } from '@/lib/images'
import { usd } from '@/lib/format'
import type { ImageStrategy, Model } from '@/lib/types'

const STRATEGIES: { id: ImageStrategy; label: string; hint: string }[] = [
  { id: 'none', label: 'No images', hint: 'Text only.' },
  { id: 'gemini-tiles', label: 'Tiles', hint: 'Charged per tile of the image, as Gemini and Claude do.' },
  { id: 'openai-patches', label: 'Patches, capped', hint: 'Charged per small patch up to a ceiling, as OpenAI does.' },
  { id: 'flat', label: 'Flat rate', hint: 'One price per image whatever its size.' },
]

const strategyLabel = (m: Model) => STRATEGIES.find((s) => s.id === m.image.strategy)?.label ?? '–'

export function RegistryView() {
  const { models, custom, saveModel, removeModel, resetOverrides } = useModelRegistry()
  const { compared, setCompared } = useAssumptions()
  const selected = compared.length > 0 ? compared : DEFAULT_COMPARED

  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
    setCompared(comparedParam(next))
  }
  const [draft, setDraft] = useState<Model | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const matching = models.filter((m) =>
      `${m.name} ${m.provider}`.toLowerCase().includes(query.trim().toLowerCase()),
    )
    const order: (keyof typeof TIER_LABELS)[] = ['frontier', 'mid', 'cheap']
    return order
      .map((tier) => ({
        tier,
        list: matching
          .filter((m) => (m.tier ?? 'mid') === tier)
          .sort((a, b) => b.inputRatePerM - a.inputRatePerM),
      }))
      .filter((g) => g.list.length > 0)
  }, [models, query])

  const edit = (m: Model) => {
    setDraft({ ...m, image: { ...m.image } })
    setErrors([])
  }

  const create = () => {
    setDraft({ ...blankModel(), id: `custom-${Date.now().toString(36)}` })
    setErrors([])
  }

  const commit = () => {
    if (!draft) return
    const found = validateModel(draft)
    if (found.length > 0) {
      setErrors(found)
      return
    }
    saveModel(draft)
    setDraft(null)
  }

  const set = <K extends keyof Model>(key: K, value: Model[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d))

  const textInput = 'mt-1.5 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-brand'
  const selectInput = `select cursor-pointer ${textInput}`

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
      <div className="min-w-0 space-y-4">
        <Card
          title="Models and rates"
          subtitle={`${selected.length} of ${models.length} shown in the comparison. Click a row to change its rates.`}
          actions={
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                aria-label="Search models"
                className="w-32 rounded-lg border border-line bg-panel px-2.5 py-1.5 text-[13px] outline-none focus:border-brand"
              />
              <Button variant="primary" onClick={create}>
                Add model
              </Button>
            </div>
          }
          flush
        >
          <div className="scroll-x pb-3">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr>
                  <th className="eyebrow w-12 pb-2 pl-4 text-left font-medium">On</th>
                  <th className="eyebrow pr-3 pb-2 pl-1 text-left font-medium">Model</th>
                  <th className="eyebrow hidden px-3 pb-2 text-right font-medium sm:table-cell">Input $/M</th>
                  <th className="eyebrow hidden px-3 pb-2 text-right font-medium sm:table-cell">Output $/M</th>
                  <th className="eyebrow hidden px-3 pb-2 text-left font-medium sm:table-cell">Images</th>
                </tr>
              </thead>
              {groups.map(({ tier, list }) => (
                <tbody key={tier}>
                  <tr>
                    <td colSpan={5} className="px-3 pt-4 pb-1">
                      <span className="eyebrow">
                        {TIER_LABELS[tier]} · {list.length}
                      </span>
                    </td>
                  </tr>
                  {list.map((m) => {
                    const editing = draft?.id === m.id
                    const isOn = selected.includes(m.id)
                    return (
                      <tr key={m.id} onClick={() => edit(m)} className={`row-pick ${editing ? 'is-selected' : ''}`}>
                        <td className="py-2.5 pr-4 pl-4">
                          <input
                            type="checkbox"
                            checked={isOn}
                            onChange={() => toggle(m.id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Compare ${m.name}`}
                            className="h-4 w-4 cursor-pointer accent-brand"
                          />
                        </td>
                        <td className="py-2.5 pr-3 pl-1">
                          <div className={`text-sm font-medium ${editing ? 'text-brand' : ''}`}>{m.name}</div>
                          <div className="mt-1 text-[13px] text-dim">
                            {m.provider}
                            {!m.builtin && ' · edited'}
                            {m.note ? ` · ${m.note}` : ''}
                          </div>
                          <div className="tabular mt-1.5 text-[13px] text-dim sm:hidden">
                            ${m.inputRatePerM} in · ${m.outputRatePerM} out · {strategyLabel(m)}
                          </div>
                        </td>
                        <td className="tabular hidden px-3 py-2.5 text-right text-sm sm:table-cell">{m.inputRatePerM}</td>
                        <td className="tabular hidden px-3 py-2.5 text-right text-sm sm:table-cell">{m.outputRatePerM}</td>
                        <td className="hidden px-3 py-2.5 sm:table-cell">
                          <span className="text-[13px] text-dim">{strategyLabel(m)}</span>
                          {m.image.strategy !== 'none' && (
                            <span className="tabular ml-1.5 text-[13px] text-faint">
                              {tokensPerImage(m.image, 1280, 720)} tok
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              ))}
            </table>
            {groups.length === 0 && (
              <p className="px-3 py-6 text-center text-[13px] text-dim">Nothing matches that search.</p>
            )}
          </div>
        </Card>

        <Callout tone="warn">{RATES_NOTE}</Callout>
      </div>

      <div className="space-y-4">
        {draft ? (
          <Card title={draft.name ? draft.name : 'New model'} subtitle="Saved in this browser only">
            <div className="space-y-4">
              <Field label="Name">
                {(id) => (
                  <input id={id} value={draft.name} onChange={(e) => set('name', e.target.value)} className={textInput} />
                )}
              </Field>
              <Field label="Provider">
                {(id) => (
                  <input
                    id={id}
                    value={draft.provider}
                    onChange={(e) => set('provider', e.target.value)}
                    className={textInput}
                  />
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Input rate">
                  {(id) => (
                    <NumberInput
                      id={id}
                      value={draft.inputRatePerM}
                      onChange={(v) => set('inputRatePerM', v)}
                      step={0.01}
                      suffix="$/M"
                    />
                  )}
                </Field>
                <Field label="Output rate">
                  {(id) => (
                    <NumberInput
                      id={id}
                      value={draft.outputRatePerM}
                      onChange={(v) => set('outputRatePerM', v)}
                      step={0.01}
                      suffix="$/M"
                    />
                  )}
                </Field>
              </div>

              <Field
                label="How images are charged"
                hint={STRATEGIES.find((s) => s.id === draft.image.strategy)?.hint}
              >
                {(id) => (
                  <Select
                    id={id}
                    value={draft.image.strategy}
                    onChange={(v) => {
                      const strategy = v as ImageStrategy
                      const defaults =
                        strategy === 'gemini-tiles'
                          ? { tileSize: 768, tokensPerTile: 258 }
                          : strategy === 'openai-patches'
                            ? { patchSize: 32, maxTokens: 1536 }
                            : strategy === 'flat'
                              ? { flatTokens: 384 }
                              : {}
                      set('image', { strategy, ...defaults })
                      set('vision', strategy !== 'none')
                    }}
                    className="mt-1.5"
                    options={STRATEGIES.map((o) => ({ value: o.id, label: o.label }))}
                  />
                )}
              </Field>

              {draft.image.strategy === 'gemini-tiles' && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Tile size">
                    {(id) => (
                      <NumberInput
                        id={id}
                        value={draft.image.tileSize ?? 768}
                        onChange={(v) => set('image', { ...draft.image, tileSize: v })}
                        suffix="px"
                      />
                    )}
                  </Field>
                  <Field label="Tokens per tile">
                    {(id) => (
                      <NumberInput
                        id={id}
                        value={draft.image.tokensPerTile ?? 258}
                        onChange={(v) => set('image', { ...draft.image, tokensPerTile: v })}
                      />
                    )}
                  </Field>
                </div>
              )}

              {draft.image.strategy === 'openai-patches' && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Patch size">
                    {(id) => (
                      <NumberInput
                        id={id}
                        value={draft.image.patchSize ?? 32}
                        onChange={(v) => set('image', { ...draft.image, patchSize: v })}
                        suffix="px"
                      />
                    )}
                  </Field>
                  <Field label="Token ceiling">
                    {(id) => (
                      <NumberInput
                        id={id}
                        value={draft.image.maxTokens ?? 1536}
                        onChange={(v) => set('image', { ...draft.image, maxTokens: v })}
                      />
                    )}
                  </Field>
                </div>
              )}

              {draft.image.strategy === 'flat' && (
                <Field label="Tokens per image">
                  {(id) => (
                    <NumberInput
                      id={id}
                      value={draft.image.flatTokens ?? 384}
                      onChange={(v) => set('image', { ...draft.image, flatTokens: v })}
                    />
                  )}
                </Field>
              )}

              {draft.image.strategy !== 'none' && (
                <p className="rounded-lg bg-raised px-3 py-2.5 text-xs leading-relaxed text-dim">
                  A 1280×720 image costs{' '}
                  <span className="tabular font-semibold text-ink">
                    {tokensPerImage(draft.image, 1280, 720)} tokens
                  </span>
                  , about {usd((tokensPerImage(draft.image, 1280, 720) * draft.inputRatePerM) / 1_000_000)} each.
                </p>
              )}

              {errors.length > 0 && (
                <ul className="space-y-0.5 text-xs text-up">
                  {errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap gap-2">
                <Button variant="primary" onClick={commit}>
                  Save
                </Button>
                <Button onClick={() => setDraft(null)}>Cancel</Button>
                {!draft.builtin && models.some((m) => m.id === draft.id) && (
                  <Button
                    onClick={() => {
                      removeModel(draft.id)
                      setDraft(null)
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <Card title="Shown in the comparison" subtitle={`${selected.length} of ${models.length} models`}>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(['frontier', 'mid', 'cheap'] as const).map((tier) => {
                  const ids = models.filter((m) => (m.tier ?? 'mid') === tier).map((m) => m.id)
                  const allOn = ids.every((id) => selected.includes(id))
                  return (
                    <Button
                      key={tier}
                      size="sm"
                      onClick={() => {
                        const next = allOn
                          ? selected.filter((id) => !ids.includes(id))
                          : [...new Set([...selected, ...ids])]
                        setCompared(comparedParam(next))
                      }}
                    >
                      {allOn ? 'Clear' : 'Add'} {TIER_LABELS[tier].toLowerCase()}
                    </Button>
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setCompared(comparedParam(models.map((m) => m.id)))}>
                  Select all
                </Button>
                <Button size="sm" onClick={() => setCompared(null)}>
                  Reset to frontier
                </Button>
              </div>
              <p className="text-[13px] leading-relaxed text-dim">
                Only ticked models appear in the calculator, and the choice travels in the share link.
              </p>
            </div>
          </Card>
        )}

        {!draft && (
          <Card title="How this works">
            <div className="space-y-3 text-[13px] leading-relaxed text-dim">
              <p>
                Every model here feeds the calculator. Rates move often, so change any of them to match what you
                actually pay, including a negotiated or self-hosted price.
              </p>
              <p>
                Image pricing differs by provider, which is why two models with similar token rates can cost very
                different amounts once pictures are involved.
              </p>
              {custom.length > 0 && (
                <div className="pt-1">
                  <Button onClick={resetOverrides}>
                    Undo my {custom.length} change{custom.length > 1 ? 's' : ''}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
