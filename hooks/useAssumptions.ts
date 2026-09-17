'use client'

import { useCallback, useMemo } from 'react'
import { useQueryState, useQueryStates } from 'nuqs'
import {
  assumptionParsers,
  assumptionsToQuery,
  modelParser,
  pruneDisabled,
  queryToAssumptions,
  volumeParser,
  comparedParser,
} from '@/lib/url'
import type { Assumptions } from '@/lib/types'

export function useAssumptions() {
  const [query, setQuery] = useQueryStates(assumptionParsers, { history: 'replace' })
  const [modelId, setModelId] = useQueryState('model', modelParser)
  const [volume, setVolume] = useQueryState('vol', volumeParser)
  const [compared, setCompared] = useQueryState('cmp', comparedParser)

  const assumptions = useMemo(() => queryToAssumptions(query), [query])

  const commit = useCallback(
    (next: Assumptions) => setQuery(pruneDisabled(next, assumptionsToQuery(next))),
    [setQuery],
  )

  const update = useCallback(
    <K extends keyof Assumptions>(key: K, value: Assumptions[K]) => {
      commit({ ...assumptions, [key]: value })
    },
    [assumptions, commit],
  )

  // Two update() calls in one handler both read the same stale assumptions, so
  // the second overwrites the first. Changing several fields goes through here.
  const updateMany = useCallback(
    (patch: Partial<Assumptions>) => commit({ ...assumptions, ...patch }),
    [assumptions, commit],
  )

  const applyAssumptions = useCallback((next: Assumptions) => commit(next), [commit])

  return {
    assumptions,
    update,
    updateMany,
    applyAssumptions,
    modelId,
    setModelId,
    volume,
    setVolume,
    compared,
    setCompared,
  }
}
