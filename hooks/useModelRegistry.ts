'use client'

import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { BUILTIN_MODELS, mergeModels } from '@/lib/registry'
import type { Model } from '@/lib/types'

const STORAGE_KEY = 'toktrics.v1.models'

export function useModelRegistry() {
  const { value: custom, setValue, hydrated } = useLocalStorage<Model[]>(STORAGE_KEY, [])

  const models = useMemo(() => mergeModels(BUILTIN_MODELS, custom), [custom])

  const saveModel = useCallback(
    (model: Model) => {
      const others = custom.filter((m) => m.id !== model.id)
      setValue([...others, { ...model, builtin: false }])
    },
    [custom, setValue],
  )

  const removeModel = useCallback(
    (id: string) => setValue(custom.filter((m) => m.id !== id)),
    [custom, setValue],
  )

  const resetOverrides = useCallback(() => setValue([]), [setValue])

  return { models, custom, saveModel, removeModel, resetOverrides, hydrated }
}
