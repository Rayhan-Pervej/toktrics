import { computeCost } from './cost'
import type { Assumptions, Model } from './types'

export interface Lever {
  id: string
  label: string
  detail: string
  apply?: (a: Assumptions) => Assumptions
  swapModelId?: string
  applies: (a: Assumptions, m: Model, all: Model[]) => boolean
}

export interface SensitivityRow {
  id: string
  label: string
  detail: string
  baselineCost: number
  leverCost: number
  deltaAbs: number
  deltaPct: number
}

// Ranked on cost under the current assumptions, not on headline rates: a model
// with low per-token rates can still cost more once images and history are counted.
const cheapestOther = (a: Assumptions, current: Model, all: Model[]): Model | undefined => {
  const currentCost = computeCost(a, current).costPerMessage
  return all
    .filter((m) => m.id !== current.id && m.vision === current.vision)
    .map((m) => ({ model: m, cost: computeCost(a, m).costPerMessage }))
    .filter((c) => c.cost < currentCost)
    .sort((x, y) => x.cost - y.cost)[0]?.model
}

export const LEVERS: Lever[] = [
  {
    id: 'drop-images-history',
    label: 'Drop images from history',
    detail: 'Remove a photo once it has been answered instead of resending it every turn.',
    apply: (a) => ({ ...a, resendImagesInHistory: false }),
    applies: (a) => a.imagesEnabled && a.resendImagesInHistory,
  },
  {
    id: 'downscale-image',
    label: 'Downscale images to 1280x720',
    detail: 'Client-side downscaling before upload.',
    apply: (a) => ({ ...a, imageWidth: 1280, imageHeight: 720 }),
    applies: (a) => a.imagesEnabled && a.imageWidth * a.imageHeight > 1280 * 720,
  },
  {
    id: 'upscale-image',
    label: 'Upload images at 1920x1080',
    detail: 'Full-resolution upload instead of downscaling.',
    apply: (a) => ({ ...a, imageWidth: 1920, imageHeight: 1080 }),
    applies: (a) => a.imagesEnabled && a.imageWidth * a.imageHeight < 1920 * 1080,
  },
  {
    id: 'double-image-rate',
    label: 'Double the image rate',
    detail: 'Twice as many messages carry a photo.',
    apply: (a) => ({ ...a, imageRate: Math.min(1, a.imageRate * 2) }),
    applies: (a) => a.imagesEnabled && a.imageRate > 0 && a.imageRate < 1,
  },
  {
    id: 'cache-system-prompt',
    label: 'Cache the system prompt',
    detail: 'Write once per session, read on later turns.',
    apply: (a) => ({ ...a, cacheSystemPrompt: true }),
    applies: (a, m) => !a.cacheSystemPrompt && m.cache !== undefined,
  },
  {
    id: 'batch-mode',
    label: 'Switch to batch pricing',
    detail: 'Asynchronous processing at a flat discount.',
    apply: (a) => ({ ...a, batchMode: true }),
    applies: (a, m) => !a.batchMode && (m.batchDiscount ?? 0) > 0,
  },
  {
    id: 'remove-buffer',
    label: 'Remove the language buffer',
    detail: 'Assume text tokenizes as efficiently as English.',
    apply: (a) => ({ ...a, bufferEnabled: false }),
    applies: (a) => a.bufferEnabled,
  },
  {
    id: 'longer-sessions',
    label: 'Sessions run 2x longer',
    detail: 'History is resent every turn, so it compounds.',
    apply: (a) => ({ ...a, sessionLength: a.sessionLength * 2 }),
    applies: () => true,
  },
  {
    id: 'halve-rag',
    label: 'Halve retrieved chunks',
    detail: 'Retrieve fewer, better chunks per turn.',
    apply: (a) => ({ ...a, ragChunkCount: Math.max(1, Math.floor(a.ragChunkCount / 2)) }),
    applies: (a) => a.ragChunkCount > 1,
  },
  {
    id: 'cheaper-model',
    label: 'Switch to the cheapest comparable model',
    detail: 'Same image support, lowest cost under these assumptions.',
    swapModelId: 'auto',
    applies: (a, m, all) => cheapestOther(a, m, all) !== undefined,
  },
]

export function computeSensitivity(
  assumptions: Assumptions,
  model: Model,
  allModels: Model[],
  levers: Lever[] = LEVERS,
): SensitivityRow[] {
  const baselineCost = computeCost(assumptions, model).costPerMessage

  return levers
    .filter((l) => l.applies(assumptions, model, allModels))
    .map((l) => {
      let leverModel = model
      let label = l.label

      if (l.swapModelId === 'auto') {
        const target = cheapestOther(assumptions, model, allModels)
        if (!target) return undefined
        leverModel = target
        label = `Switch to ${target.name}`
      }

      const leverAssumptions = l.apply ? l.apply(assumptions) : assumptions
      const leverCost = computeCost(leverAssumptions, leverModel).costPerMessage

      return {
        id: l.id,
        label,
        detail: l.detail,
        baselineCost,
        leverCost,
        deltaAbs: leverCost - baselineCost,
        deltaPct: baselineCost === 0 ? 0 : ((leverCost - baselineCost) / baselineCost) * 100,
      }
    })
    .filter((r): r is SensitivityRow => r !== undefined && Math.abs(r.deltaPct) > 0.01)
    .sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct))
}
