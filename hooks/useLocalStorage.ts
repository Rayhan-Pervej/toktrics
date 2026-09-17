'use client'

import { useCallback, useEffect, useState } from 'react'

// Read after mount only, so server-rendered markup and first paint agree.
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw) setValue(JSON.parse(raw) as T)
    } catch {
      // corrupt or unavailable storage falls back to the initial value
    }
    setHydrated(true)
  }, [key])

  const persist = useCallback(
    (next: T) => {
      setValue(next)
      try {
        window.localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // quota or private mode; in-memory value still updates
      }
    },
    [key],
  )

  return { value, setValue: persist, hydrated }
}
