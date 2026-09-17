import modelData from '@/data/models.json'
import type { Model, ModelTier } from './types'

export const BUILTIN_MODELS = modelData.models as unknown as Model[]
export const RATES_VERIFIED = modelData.ratesVerified
export const RATES_NOTE = modelData.note

export function getModel(models: Model[], id: string): Model | undefined {
  return models.find((m) => m.id === id)
}

export function mergeModels(builtin: Model[], custom: Model[]): Model[] {
  const byId = new Map(builtin.map((m) => [m.id, m]))
  for (const m of custom) byId.set(m.id, { ...m, builtin: false })
  return [...byId.values()]
}

export function validateModel(m: Partial<Model>): string[] {
  const errors: string[] = []
  if (!m.id?.trim()) errors.push('Model needs an id')
  if (!m.name?.trim()) errors.push('Model needs a name')
  if (typeof m.inputRatePerM !== 'number' || m.inputRatePerM < 0) errors.push('Input rate must be zero or more')
  if (typeof m.outputRatePerM !== 'number' || m.outputRatePerM < 0) errors.push('Output rate must be zero or more')
  if (!m.image?.strategy) errors.push('Pick an image tokenization strategy')
  return errors
}

export function blankModel(): Model {
  return {
    id: '',
    name: '',
    provider: '',
    inputRatePerM: 0,
    outputRatePerM: 0,
    image: { strategy: 'none' },
    vision: false,
    builtin: false,
  }
}

export const DEFAULT_COMPARED = BUILTIN_MODELS.filter((m) => m.tier === 'frontier').map((m) => m.id)

export const TIER_LABELS: Record<ModelTier, string> = {
  frontier: 'Frontier',
  mid: 'Mid range',
  cheap: 'Low cost',
}

export function modelsForComparison(models: Model[], selectedIds: string[]): Model[] {
  if (selectedIds.length === 0) return models
  const wanted = new Set(selectedIds)
  return models.filter((m) => wanted.has(m.id))
}

// The default set lives in the app, not the URL, so a selection matching it
// clears the param rather than listing every id.
export function comparedParam(ids: string[]): string[] | null {
  if (ids.length === 0) return null
  const same =
    ids.length === DEFAULT_COMPARED.length && DEFAULT_COMPARED.every((id) => ids.includes(id))
  return same ? null : ids
}
