import type { Metadata } from 'next'
import { Suspense } from 'react'
import { RegistryView } from '@/components/registry/RegistryView'
import { PageIntro } from '@/components/ui/PageIntro'
import { BUILTIN_MODELS, RATES_VERIFIED } from '@/lib/registry'
import { PAGES } from '@/lib/site'

export const metadata: Metadata = {
  title: PAGES.models.title,
  description: PAGES.models.description,
  alternates: { canonical: PAGES.models.path },
  openGraph: { title: PAGES.models.heading, description: PAGES.models.description, url: PAGES.models.path },
}

const providers = [...new Set(BUILTIN_MODELS.map((m) => m.provider))]

export default function Page() {
  return (
    <>
      <PageIntro heading={PAGES.models.heading}>
        <p>
          Input and output rates for {BUILTIN_MODELS.length} models from {providers.length} providers, checked{' '}
          {RATES_VERIFIED}. Every rate is editable, so you can match a negotiated or self-hosted price.
        </p>
        <p>
          Providers charge for images differently, by tile, by patch up to a ceiling, or at a flat rate per picture,
          which is why two models with similar token rates can cost very different amounts once pictures are
          involved.
        </p>
      </PageIntro>

      {/* Server rendered so the rates are indexable; the interactive table follows. */}
      <div className="sr-only">
        <h2>Model rates per million tokens</h2>
        <ul>
          {BUILTIN_MODELS.map((m) => (
            <li key={m.id}>
              {m.name} by {m.provider}: ${m.inputRatePerM} per million input tokens, ${m.outputRatePerM} per million
              output tokens.
            </li>
          ))}
        </ul>
      </div>

      <Suspense fallback={<div className="py-16 text-center text-sm text-dim">Loading models…</div>}>
        <RegistryView />
      </Suspense>
    </>
  )
}
