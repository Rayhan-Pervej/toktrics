import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CalculatorView } from '@/components/calculator/CalculatorView'
import { PageIntro } from '@/components/ui/PageIntro'
import { BUILTIN_MODELS } from '@/lib/registry'
import { PAGES, SITE_NAME, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: { absolute: SITE_NAME },
  description: PAGES.home.description,
  alternates: { canonical: PAGES.home.path },
  openGraph: { title: PAGES.home.heading, description: PAGES.home.description, url: PAGES.home.path },
}

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'toktrics',
  url: SITE_URL,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  description: PAGES.home.description,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    'Per-message cost for 30 language models',
    'Counts conversation history resent on every turn',
    'Counts images charged again each turn',
    'Prompt caching and batch pricing',
    'Tokenizer overhead for non-English text',
  ],
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />

      <PageIntro heading={PAGES.home.heading}>
        <p>
          Rate cards tell you the price per million tokens. They do not tell you what a conversation costs, because
          the tokens you pay for are not the ones you sent. Earlier turns go back to the model on every reply, an
          image stays in the transcript and is charged again each turn, and text in some languages splits into far
          more tokens than the same words in English.
        </p>
        <p>
          Set out your assumptions below and toktrics works the real figure out for{' '}
          {BUILTIN_MODELS.length} models, shows every step of the arithmetic, and ranks what would change the number
          most.
        </p>
      </PageIntro>

      <Suspense fallback={<div className="py-16 text-center text-sm text-dim">Loading calculator…</div>}>
        <CalculatorView />
      </Suspense>
    </>
  )
}
