'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export function Brand() {
  const searchParams = useSearchParams()
  // Keep the scenario when returning home, as the tabs do.
  const search = searchParams.size > 0 ? `?${searchParams.toString()}` : ''

  return (
    <Link
      href={`/${search}`}
      className="text-[17px] font-semibold tracking-tight transition-opacity hover:opacity-80"
    >
      toktrics
    </Link>
  )
}
