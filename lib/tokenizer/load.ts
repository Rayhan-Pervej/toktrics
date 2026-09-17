export interface Encoder {
  encode: (text: string) => number[]
  decode: (tokens: number[]) => string
}

const cache = new Map<string, Promise<Encoder>>()

// Each encoding statically pulls in a multi-megabyte BPE table, so it must only
// ever be reached through this dynamic import.
function importEncoding(id: string): Promise<Encoder> {
  switch (id) {
    case 'o200k_base':
      return import('gpt-tokenizer/encoding/o200k_base')
    case 'cl100k_base':
      return import('gpt-tokenizer/encoding/cl100k_base')
    case 'o200k_harmony':
      return import('gpt-tokenizer/encoding/o200k_harmony')
    case 'p50k_base':
      return import('gpt-tokenizer/encoding/p50k_base')
    case 'r50k_base':
      return import('gpt-tokenizer/encoding/r50k_base')
    default:
      return Promise.reject(new Error(`Unknown encoding: ${id}`))
  }
}

export function loadEncoder(id: string): Promise<Encoder> {
  const existing = cache.get(id)
  if (existing) return existing
  const loading = importEncoding(id)
  cache.set(id, loading)
  return loading
}

export function isEncoderLoaded(id: string): boolean {
  return cache.has(id)
}
