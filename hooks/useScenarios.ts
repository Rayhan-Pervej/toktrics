'use client'

import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { Assumptions, Scenario } from '@/lib/types'

const STORAGE_KEY = 'toktrics.v1.scenarios'

export function useScenarios() {
  const { value: scenarios, setValue, hydrated } = useLocalStorage<Scenario[]>(STORAGE_KEY, [])

  const save = useCallback(
    (name: string, modelId: string, assumptions: Assumptions) => {
      const scenario: Scenario = {
        id: `${Date.now().toString(36)}`,
        name,
        modelId,
        assumptions,
        savedAt: new Date().toISOString(),
      }
      setValue([scenario, ...scenarios].slice(0, 20))
      return scenario
    },
    [scenarios, setValue],
  )

  const remove = useCallback(
    (id: string) => setValue(scenarios.filter((s) => s.id !== id)),
    [scenarios, setValue],
  )

  return { scenarios, save, remove, hydrated }
}
