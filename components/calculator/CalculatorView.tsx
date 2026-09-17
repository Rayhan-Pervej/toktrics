'use client'

import { useMemo, useState } from 'react'
import { AssumptionsPanel } from './AssumptionsPanel'
import { BreakdownView } from './BreakdownView'
import { CostTable } from './CostTable'
import { PricingPanel } from './PricingPanel'
import { ResultHero } from './ResultHero'
import { SensitivityPanel } from './SensitivityPanel'
import { ScenarioBar } from './ScenarioBar'
import { Button, Card, Disclosure } from '@/components/ui/primitives'
import { useAssumptions } from '@/hooks/useAssumptions'
import { useModelRegistry } from '@/hooks/useModelRegistry'
import { compareModels, computeCost, explainCost } from '@/lib/cost'
import { computeSensitivity } from '@/lib/sensitivity'
import { costResultsToCsv, download } from '@/lib/export/csv'
import { toMarkdown } from '@/lib/export/markdown'
import { DEFAULT_COMPARED, modelsForComparison, RATES_NOTE } from '@/lib/registry'
import { DEFAULT_ASSUMPTIONS, EMPTY_ASSUMPTIONS } from '@/lib/presets'

export function CalculatorView() {
  const { assumptions, update, applyAssumptions, modelId, setModelId, volume, setVolume, compared } =
    useAssumptions()
  const { models } = useModelRegistry()
  const [copied, setCopied] = useState<string | null>(null)

  const model = useMemo(() => models.find((m) => m.id === modelId) ?? models[0], [models, modelId])
  const shortlist = useMemo(
    () => modelsForComparison(models, compared.length > 0 ? compared : DEFAULT_COMPARED),
    [models, compared],
  )
  const results = useMemo(() => compareModels(assumptions, shortlist), [assumptions, shortlist])
  const result = useMemo(() => (model ? computeCost(assumptions, model) : undefined), [assumptions, model])
  const steps = useMemo(() => (model ? explainCost(assumptions, model) : []), [assumptions, model])
  const levers = useMemo(
    () => (model ? computeSensitivity(assumptions, model, shortlist) : []),
    [assumptions, model, shortlist],
  )

  const isDefault = useMemo(
    () => (Object.keys(DEFAULT_ASSUMPTIONS) as (keyof typeof DEFAULT_ASSUMPTIONS)[]).every(
      (k) => assumptions[k] === DEFAULT_ASSUMPTIONS[k],
    ),
    [assumptions],
  )

  if (!model || !result) return null

  const flash = (label: string) => {
    setCopied(label)
    setTimeout(() => setCopied(null), 1800)
  }

  return (
    <div className="space-y-5">
      <ScenarioBar
        assumptions={assumptions}
        modelId={model.id}
        onRestore={(s) => {
          applyAssumptions(s.assumptions)
          setModelId(s.modelId)
        }}
        onClear={() => applyAssumptions(EMPTY_ASSUMPTIONS)}
        onReset={() => applyAssumptions(DEFAULT_ASSUMPTIONS)}
        isDefault={isDefault}
      />

      <ResultHero
        result={result}
        model={model}
        volume={volume}
        sessionLength={assumptions.sessionLength}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        <AssumptionsPanel assumptions={assumptions} update={update} model={model} />

        <div className="min-w-0 space-y-4">
          <CostTable
            results={results}
            models={shortlist}
            selectedId={model.id}
            onSelect={setModelId}
            volume={volume}
            onVolumeChange={setVolume}
          />

          <Disclosure title="If you are charging for this" summary="Optional: margin at a given price">
            <PricingPanel costPerMessage={result.costPerMessage} volume={volume} />
          </Disclosure>

          <Disclosure title="What changes the cost most" summary={`${levers.length} options ranked by impact`}>
            <SensitivityPanel rows={levers} />
          </Disclosure>

          <Disclosure title="How this is calculated" summary="Every step, so you can check it">
            <BreakdownView steps={steps} modelName={model.name} />
          </Disclosure>

          <Card
            title="Share and export"
            actions={
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(window.location.href)
                    flash('link')
                  }}
                >
                  {copied === 'link' ? 'Copied' : 'Copy link'}
                </Button>
                <Button
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(toMarkdown(assumptions, model, shortlist, 'Cost model', volume))
                    flash('md')
                  }}
                >
                  {copied === 'md' ? 'Copied' : 'Markdown'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => download('toktrics-costs.csv', costResultsToCsv(results, shortlist, volume), 'text/csv')}
                >
                  CSV
                </Button>
              </div>
            }
          >
            <p className="text-[13px] leading-relaxed text-dim">
              The link carries every assumption you changed, so anyone who opens it sees this exact scenario.{' '}
              {RATES_NOTE}
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
