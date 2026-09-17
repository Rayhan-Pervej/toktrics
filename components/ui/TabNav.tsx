'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

const TABS = [
  { href: '/', label: 'Calculator' },
  { href: '/tokenizer', label: 'Languages' },
  { href: '/models', label: 'Models' },
  { href: '/about', label: 'About' },
]

export function TabNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // Assumptions live in the query string, so tabs must preserve it.
  const search = searchParams.size > 0 ? `?${searchParams.toString()}` : ''

  return (
    <nav className="flex items-center gap-0.5 sm:gap-1">
      {TABS.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={`${tab.href}${search}`}
            aria-current={active ? 'page' : undefined}
            className={`shrink-0 rounded-lg border px-1.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-[13px] ${
              active
                ? 'border-brand-line bg-brand-soft text-brand'
                : 'border-transparent text-dim hover:bg-raised hover:text-ink'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
