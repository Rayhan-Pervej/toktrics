import type { ReactNode } from 'react'

// Server rendered, so crawlers get real content instead of a loading state.
export function PageIntro({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="mb-6 max-w-2xl">
      <h1 className="text-[26px] leading-tight font-semibold tracking-tight sm:text-[30px]">{heading}</h1>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-dim">{children}</div>
    </section>
  )
}
