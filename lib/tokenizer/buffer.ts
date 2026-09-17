export interface SampleMeasurement {
  label: string
  text: string
  chars: number
  tokenCount: number
  charsPerToken: number
}

export interface BufferEstimate {
  reference: SampleMeasurement | undefined
  samples: SampleMeasurement[]
  suggestedBuffer: number
}

export function measureSample(label: string, text: string, tokenCount: number): SampleMeasurement {
  const chars = [...text].length
  return {
    label,
    text,
    chars,
    tokenCount,
    charsPerToken: tokenCount === 0 ? 0 : chars / tokenCount,
  }
}

// Languages are compared on parallel text: the same sentence in each language.
// Token counts are then directly comparable, unlike per-word ratios, which break
// down for scripts that do not separate words with spaces.
export function estimateBuffer(samples: SampleMeasurement[], referenceLabel = 'English'): BufferEstimate {
  const reference = samples.find((s) => s.label === referenceLabel) ?? samples[0]
  if (!reference || reference.tokenCount === 0) {
    return { reference, samples, suggestedBuffer: 1 }
  }

  const others = samples.filter((s) => s !== reference && s.tokenCount > 0)
  if (others.length === 0) return { reference, samples, suggestedBuffer: 1 }

  const worst = Math.max(...others.map((s) => s.tokenCount / reference.tokenCount))
  return { reference, samples, suggestedBuffer: Math.max(1, worst) }
}

// The buffer for one chosen language, or the worst of them when none is chosen.
export function bufferFor(
  samples: SampleMeasurement[],
  selectedLabel: string | null,
  referenceLabel = 'English',
): number {
  const estimate = estimateBuffer(samples, referenceLabel)
  if (!selectedLabel) return estimate.suggestedBuffer

  const selected = samples.find((s) => s.label === selectedLabel)
  if (!selected || !estimate.reference || estimate.reference.tokenCount === 0) return 1
  return Math.max(1, selected.tokenCount / estimate.reference.tokenCount)
}

export function relativeCost(sample: SampleMeasurement, reference: SampleMeasurement | undefined): number {
  if (!reference || reference.tokenCount === 0) return 1
  return sample.tokenCount / reference.tokenCount
}

export function roundBuffer(value: number): number {
  return Math.round(value * 100) / 100
}
