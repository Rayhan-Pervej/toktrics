import type { Metadata } from 'next'
import { Suspense } from 'react'
import { TokenizerView } from '@/components/tokenizer/TokenizerView'
import { PageIntro } from '@/components/ui/PageIntro'
import { PAGES } from '@/lib/site'

export const metadata: Metadata = {
  title: PAGES.languages.title,
  description: PAGES.languages.description,
  alternates: { canonical: PAGES.languages.path },
  openGraph: { title: PAGES.languages.heading, description: PAGES.languages.description, url: PAGES.languages.path },
}

export default function Page() {
  return (
    <>
      <PageIntro heading={PAGES.languages.heading}>
        <p>
          Tokenizer vocabularies are built mostly from English text, so identical meaning in another script can cost
          more tokens. You pay per token, which makes the same conversation more expensive in some languages than
          others.
        </p>
        <p>
          Measured on the sentence below, Bangla costs about 1.46 times the English tokens and Hindi about 1.54
          times, while Chinese comes in at roughly the same count because each character carries more meaning. Edit
          any line to measure your own copy.
        </p>
      </PageIntro>

      <Suspense fallback={<div className="py-16 text-center text-sm text-dim">Loading tokenizer…</div>}>
        <TokenizerView />
      </Suspense>
    </>
  )
}
