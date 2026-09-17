'use client'

import { Card, Disclosure, Field, NumberInput, Slider, Toggle } from '@/components/ui/primitives'
import type { Assumptions, Model } from '@/lib/types'

export function AssumptionsPanel({
  assumptions: a,
  update,
  model,
}: {
  assumptions: Assumptions
  update: <K extends keyof Assumptions>(key: K, value: Assumptions[K]) => void
  model: Model | undefined
}) {
  return (
    <div className="space-y-4">
      <Card title="Your setup" subtitle="Change anything. The cost updates as you type.">
        <div className="space-y-5 pt-2">
          <Field
            label="Messages per conversation"
            value={`${a.sessionLength}`}
            hint="Earlier turns are sent again each time, so longer conversations cost more per message."
          >
            {(id) => (
              <Slider
                id={id}
                label="Messages per conversation"
                value={a.sessionLength}
              onChange={(v) => update('sessionLength', v)}
                min={1}
                max={40}
                format={(v) => `${v}`}
              />
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="System prompt" hint="Instructions and tool definitions, sent on every call.">
              {(id) => (
                <NumberInput id={id} value={a.systemPromptTokens} onChange={(v) => update('systemPromptTokens', v)} suffix="tok" />
              )}
            </Field>
            <Field label="Reply length" hint="What the model writes back.">
              {(id) => <NumberInput id={id} value={a.replyTokens} onChange={(v) => update('replyTokens', v)} suffix="tok" />}
            </Field>
          </div>

          <Field label="Retrieved context per turn" hint="Set to zero if you do not use retrieval.">
            {(id) => (
              <div className="mt-1.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <NumberInput
                  id={id}
                  label="Retrieved chunks per turn"
                  value={a.ragChunkCount}
                  onChange={(v) => update('ragChunkCount', v)}
                  suffix="chunks"
                />
                <span className="text-xs text-faint">×</span>
                <NumberInput
                  label="Tokens per retrieved chunk"
                  value={a.ragChunkTokens}
                  onChange={(v) => update('ragChunkTokens', v)}
                  suffix="tok"
                />
              </div>
            )}
          </Field>
        </div>
      </Card>

      <Disclosure
        title="Images"
        summary={
          a.imagesEnabled
            ? `${Math.round(a.imageRate * 100)}% of messages, ${a.imageWidth}×${a.imageHeight}`
            : 'Off'
        }
      >
        <div className="space-y-4">
          <Toggle
            label="Messages can include images"
            checked={a.imagesEnabled}
            onChange={(v) => update('imagesEnabled', v)}
          />
          {a.imagesEnabled && (
            <>
              <Field label="Share of messages with an image" value={`${Math.round(a.imageRate * 100)}%`}>
                {(id) => (
                  <Slider
                    id={id}
                    label="Share of messages with an image"
                    value={Math.round(a.imageRate * 100)}
                    onChange={(v) => update('imageRate', v / 100)}
                    min={0}
                    max={100}
                    format={(v) => `${v}%`}
                  />
                )}
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Width">
                  {(id) => <NumberInput id={id} value={a.imageWidth} onChange={(v) => update('imageWidth', v)} suffix="px" step={16} />}
                </Field>
                <Field label="Height">
                  {(id) => <NumberInput id={id} value={a.imageHeight} onChange={(v) => update('imageHeight', v)} suffix="px" step={16} />}
                </Field>
              </div>
              <Toggle
                label="Images stay in the conversation"
                checked={a.resendImagesInHistory}
                onChange={(v) => update('resendImagesInHistory', v)}
                hint="An image left in the transcript is charged again on every later turn."
              />
            </>
          )}
        </div>
      </Disclosure>

      <Disclosure
        title="Language"
        summary={a.bufferEnabled ? `${a.languageBuffer.toFixed(2)}× uplift on text` : 'English only'}
      >
        <div className="space-y-4">
          <Toggle
            label="Traffic is not only English"
            checked={a.bufferEnabled}
            onChange={(v) => update('bufferEnabled', v)}
            hint={
              a.bufferEnabled
                ? 'Other scripts split into more tokens for the same meaning. Switching this off clears the multiplier.'
                : 'Other scripts split into more tokens for the same meaning. Measure yours on the Languages tab.'
            }
          />
          {a.bufferEnabled && (
            <Field label="Token uplift">
              {(id) => (
                <NumberInput
                  id={id}
                  value={a.languageBuffer}
                  onChange={(v) => update('languageBuffer', Math.max(1, v))}
                  min={1}
                  step={0.01}
                  suffix="×"
                />
              )}
            </Field>
          )}
        </div>
      </Disclosure>

      <Disclosure title="Advanced" summary="Caching, batch pricing, extra costs">
        <div className="space-y-5">
          <Toggle
            label="Cache the system prompt"
            checked={a.cacheSystemPrompt}
            onChange={(v) => update('cacheSystemPrompt', v)}
            hint={
              model?.cache
                ? `Providers charge less to reread a prompt they already hold. Written once at ${model.cache.writeMultiplier}x, then read at ${model.cache.readMultiplier}x on the remaining turns.`
                : 'This model has no caching rates set, so the toggle has no effect.'
            }
          />
          <Toggle
            label="Batch pricing"
            checked={a.batchMode}
            onChange={(v) => update('batchMode', v)}
            hint={
              (model?.batchDiscount ?? 0) > 0
                ? `Submit work in bulk and wait for it. Applies ${Math.round((model?.batchDiscount ?? 0) * 100)}% off input and output. Not usable for anything interactive.`
                : 'This model has no batch discount set.'
            }
          />
          <Field label="User message" hint="Average inbound message. Counts once when sent, then again in history on later turns.">
            {(id) => <NumberInput id={id} value={a.userMessageTokens} onChange={(v) => update('userMessageTokens', v)} suffix="tok" />}
          </Field>
          <Field
            label="Tool call output"
            hint="Tokens the model writes when calling a tool, on top of the reply. Leave at 0 if you use no tools."
          >
            {(id) => <NumberInput id={id} value={a.toolTokens} onChange={(v) => update('toolTokens', v)} suffix="tok" />}
          </Field>
          <Field
            label="Other costs per message"
            hint="Added to every message, on top of the model. Vector search, storage, your own compute. Leave at 0 to count model cost only."
          >
            {(id) => (
              <NumberInput
                id={id}
                value={a.overheadPerMessage}
                onChange={(v) => update('overheadPerMessage', v)}
                step={0.00001}
                suffix="$"
              />
            )}
          </Field>
        </div>
      </Disclosure>
    </div>
  )
}
