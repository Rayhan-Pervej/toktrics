'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button, Card, Field, NumberInput } from '@/components/ui/primitives'
import { Select } from '@/components/ui/Select'
import { DEFAULT_ENCODING, ENCODINGS } from '@/lib/tokenizer/encodings'
import { loadEncoder, type Encoder } from '@/lib/tokenizer/load'
import { bufferFor, estimateBuffer, measureSample, relativeCost, roundBuffer } from '@/lib/tokenizer/buffer'
import { useSearchParams } from 'next/navigation'
import { useAssumptions } from '@/hooks/useAssumptions'

const PARALLEL_TEXT = [
  { label: 'English', text: 'Thank you for your help. Could you explain how this works?' },
  { label: 'Bangla', text: 'আপনার সাহায্যের জন্য ধন্যবাদ। এটি কীভাবে কাজ করে বুঝিয়ে বলবেন?' },
  { label: 'Hindi', text: 'आपकी मदद के लिए धन्यवाद। क्या आप समझा सकते हैं कि यह कैसे काम करता है?' },
  { label: 'Japanese', text: 'ご協力ありがとうございます。これがどう動くか説明してもらえますか。' },
  { label: 'Chinese', text: '谢谢你的帮助。你能解释一下这是如何工作的吗？' },
]

export function TokenizerView() {
  const { assumptions, update, updateMany } = useAssumptions()
  const [encodingId, setEncodingId] = useState(DEFAULT_ENCODING)
  const [encoder, setEncoder] = useState<Encoder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [texts, setTexts] = useState(() => PARALLEL_TEXT.map((s) => s.text))
  const [picked, setPicked] = useState<string>('English')
  const [applied, setApplied] = useState(false)
  const searchParams = useSearchParams()
  // Assumptions live in the query string, so the link has to carry it across.
  const search = searchParams.size > 0 ? `?${searchParams.toString()}` : ''

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    loadEncoder(encodingId)
      .then((enc) => !cancelled && setEncoder(enc))
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : 'Failed to load tokenizer'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [encodingId])

  const samples = useMemo(() => {
    if (!encoder) return []
    return PARALLEL_TEXT.map((s, i) =>
      measureSample(s.label, texts[i], texts[i] ? encoder.encode(texts[i]).length : 0),
    )
  }, [encoder, texts])

  const estimate = useMemo(() => estimateBuffer(samples), [samples])
  const suggested = roundBuffer(bufferFor(samples, picked))

  const inspected = samples.find((s) => s.label === picked) ?? samples[0]
  const pieces = useMemo(() => {
    if (!encoder || !inspected?.text) return []
    return encoder.encode(inspected.text).map((id) => ({ id, text: encoder.decode([id]) }))
  }, [encoder, inspected])

  const inUse = assumptions.bufferEnabled && Math.abs(assumptions.languageBuffer - suggested) < 0.005

  return (
    <div className="space-y-5">
      <div className="flex justify-start sm:justify-end">
        <Select
          value={encodingId}
          onChange={setEncodingId}
          label="Tokenizer encoding"
          className="w-full sm:w-72"
          options={ENCODINGS.map((enc) => ({ value: enc.id, label: enc.label, hint: enc.usedBy }))}
        />
      </div>

      <p className="rounded-lg bg-raised px-3 py-2.5 text-xs leading-relaxed text-dim">
        These are OpenAI tokenizers, the only ones that run in a browser. Anthropic, Google and the rest keep theirs
        server side, so treat the ratio below as a good guide to how your languages compare rather than an exact
        count for every model.
      </p>

      {loading && <p className="text-xs text-dim">Loading {encodingId} tokenizer…</p>}
      {error && <p className="text-xs text-up">{error}</p>}

      {!loading && samples.length > 0 && (
        <>
          <Card>
            <div className="space-y-2.5">
              {samples.map((s, i) => {
                const ratio = relativeCost(s, estimate.reference)
                const isRef = s === estimate.reference
                const cheaper = ratio < 0.995

                return (
                  <div
                    key={s.label}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-lg px-1 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => setPicked(s.label)}
                      className={`w-fit cursor-pointer text-left text-[13px] font-medium transition-colors ${
                        picked === s.label ? 'text-brand' : 'text-dim hover:text-ink'
                      }`}
                    >
                      {s.label}
                    </button>

                    <div className="flex items-baseline justify-end gap-3">
                      <span className="tabular text-sm text-ink">{s.tokenCount}</span>
                      <span
                        className={`tabular text-xs ${isRef ? 'text-faint' : cheaper ? 'text-down' : 'text-brand'}`}
                      >
                        {isRef ? 'baseline' : `${ratio.toFixed(2)}x`}
                      </span>
                    </div>

                    <div className="col-span-2 min-w-0">
                      <input
                        value={texts[i]}
                        onChange={(e) => {
                          const next = [...texts]
                          next[i] = e.target.value
                          setTexts(next)
                        }}
                        onFocus={() => setPicked(s.label)}
                        aria-label={`${s.label} sample text`}
                        className={`w-full truncate rounded-md border bg-panel px-2 py-1.5 text-sm text-ink outline-none transition-colors ${
                          picked === s.label ? 'border-brand' : 'border-line hover:border-faint'
                        }`}
                      />
                    </div>

                  </div>
                )
              })}
            </div>
          </Card>

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card title={`Token boundaries: ${inspected?.label ?? ''}`} subtitle={`${pieces.length} tokens`}>
              <div className="flex flex-wrap gap-0.5 text-xs leading-relaxed">
                {pieces.map((p, i) => (
                  <span
                    key={i}
                    title={`#${p.id}`}
                    className="rounded border border-line bg-raised px-1 py-0.5 whitespace-pre text-ink"
                  >
                    {p.text === ' ' ? '␣' : p.text.replace(/\n/g, '⏎')}
                  </span>
                ))}
              </div>
              {inspected && inspected.tokenCount > 0 && (
                <p className="mt-3 text-[11px] text-faint">
                  {inspected.chars} chars · {inspected.charsPerToken.toFixed(2)} chars per token
                </p>
              )}
            </Card>

            <div className="space-y-4">
              <Card
                title="Measured buffer"
                subtitle={`Priced for ${picked}`}
              >
                <div className="tabular text-4xl leading-none font-medium text-brand">
                  {suggested.toFixed(2)}
                  <span className="text-2xl text-faint">x</span>
                </div>
                <p className="mt-2.5 text-xs leading-relaxed text-dim">
                  {suggested <= 1.005
                    ? 'English is the baseline, so there is no uplift. Pick another language above to price for it.'
                    : `Text written in ${picked} costs ${suggested.toFixed(2)}x the English baseline. Images are unaffected, since they price on pixels.`}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    variant="primary"
                    disabled={inUse}
                    onClick={() => {
                      updateMany({ languageBuffer: suggested, bufferEnabled: true })
                      setApplied(true)
                      setTimeout(() => setApplied(false), 2500)
                    }}
                  >
                    {inUse ? 'In use' : 'Use in calculator'}
                  </Button>
                  {(applied || inUse) && (
                    <Link
                      href={`/${search}`}
                      className="text-[13px] font-medium text-brand hover:underline"
                    >
                      Open calculator
                    </Link>
                  )}
                </div>
                <p className="mt-3 border-t border-line-soft pt-2.5 text-xs text-dim">
                  Calculator is using{' '}
                  <span className="tabular font-semibold text-ink">
                    {assumptions.bufferEnabled ? `${assumptions.languageBuffer.toFixed(2)}x` : 'no uplift'}
                  </span>
                  {inUse ? ', matching the measurement above.' : '. Applying changes it.'}
                </p>
              </Card>

              <Card title="Set it manually">
                <Field label="Buffer multiplier" hint="Applied to all text tokens in the cost model.">
                  {(id) => (
                    <NumberInput
                      id={id}
                      value={assumptions.languageBuffer}
                      onChange={(v) => update('languageBuffer', Math.max(1, v))}
                      min={1}
                      step={0.01}
                      suffix="x"
                    />
                  )}
                </Field>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
