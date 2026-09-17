export interface EncodingMeta {
  id: string
  label: string
  usedBy: string
}

export const ENCODINGS: EncodingMeta[] = [
  { id: 'o200k_base', label: 'o200k_base', usedBy: 'GPT-4o and later' },
  { id: 'cl100k_base', label: 'cl100k_base', usedBy: 'GPT-4, GPT-3.5' },
  { id: 'o200k_harmony', label: 'o200k_harmony', usedBy: 'Harmony-format models' },
  { id: 'p50k_base', label: 'p50k_base', usedBy: 'Codex, older completions' },
  { id: 'r50k_base', label: 'r50k_base', usedBy: 'GPT-3' },
]

export const DEFAULT_ENCODING = 'o200k_base'
