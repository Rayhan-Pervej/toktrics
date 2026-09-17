'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/primitives'
import { useScenarios } from '@/hooks/useScenarios'
import type { Assumptions, Scenario } from '@/lib/types'

export function ScenarioBar({
  assumptions,
  modelId,
  onRestore,
  onClear,
  onReset,
  isDefault,
}: {
  assumptions: Assumptions
  modelId: string
  onRestore: (s: Scenario) => void
  onClear: () => void
  onReset: () => void
  isDefault: boolean
}) {
  const { scenarios, save, remove, hydrated } = useScenarios()
  const [naming, setNaming] = useState(false)
  const [name, setName] = useState('')

  const commit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    save(trimmed, modelId, assumptions)
    setName('')
    setNaming(false)
  }

  const cancel = () => {
    setName('')
    setNaming(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {hydrated && scenarios.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="eyebrow mr-1">Saved</span>
          {scenarios.map((s) => (
            <span
              key={s.id}
              className="flex items-center gap-1.5 rounded-md border border-line bg-panel px-2.5 py-1 text-xs shadow-card"
            >
              <button type="button" onClick={() => onRestore(s)} className="font-medium hover:text-brand">
                {s.name}
              </button>
              <button
                type="button"
                onClick={() => remove(s.id)}
                aria-label={`Delete ${s.name}`}
                className="text-faint hover:text-up"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button onClick={onClear} title="Set every field to zero">
          Clear all
        </Button>
        <Button onClick={onReset} disabled={isDefault} title="Restore the starting values">
          Defaults
        </Button>

        {naming ? (
          <>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit()
                if (e.key === 'Escape') cancel()
              }}
              placeholder="Name this scenario"
              className="w-44 rounded-lg border border-line bg-panel px-3 py-2 text-[13px] outline-none focus:border-brand"
            />
            <Button variant="primary" onClick={commit} disabled={name.trim() === ''}>
              Save
            </Button>
            <Button variant="quiet" onClick={cancel}>
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={() => setNaming(true)}>Save scenario</Button>
        )}
      </div>
    </div>
  )
}
