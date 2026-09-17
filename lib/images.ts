import type { ImageTokenizer } from './types'

export function tokensPerImage(t: ImageTokenizer, width: number, height: number): number {
  if (width <= 0 || height <= 0) return 0

  switch (t.strategy) {
    case 'gemini-tiles': {
      const tile = t.tileSize ?? 768
      const perTile = t.tokensPerTile ?? 258
      const tiles = Math.max(1, Math.ceil(width / tile) * Math.ceil(height / tile))
      return tiles * perTile
    }
    case 'openai-patches': {
      const patch = t.patchSize ?? 32
      const cap = t.maxTokens ?? 1536
      const patches = Math.ceil(width / patch) * Math.ceil(height / patch)
      return Math.min(cap, patches)
    }
    case 'flat':
      return t.flatTokens ?? 0
    case 'none':
      return 0
  }
}

export function describeImageStrategy(t: ImageTokenizer, width: number, height: number): string {
  switch (t.strategy) {
    case 'gemini-tiles': {
      const tile = t.tileSize ?? 768
      return `ceil(${width}/${tile}) x ceil(${height}/${tile}) x ${t.tokensPerTile ?? 258}`
    }
    case 'openai-patches': {
      const patch = t.patchSize ?? 32
      return `min(${t.maxTokens ?? 1536}, ceil(${width}/${patch}) x ceil(${height}/${patch}))`
    }
    case 'flat':
      return `flat ${t.flatTokens ?? 0} per image`
    case 'none':
      return 'no image support'
  }
}
