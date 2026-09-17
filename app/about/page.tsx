import type { Metadata } from 'next'
import { PageIntro } from '@/components/ui/PageIntro'
import { BUILTIN_MODELS } from '@/lib/registry'
import { AUTHOR, PAGES, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: PAGES.about.title,
  description: PAGES.about.description,
  alternates: { canonical: PAGES.about.path },
  openGraph: { title: PAGES.about.heading, description: PAGES.about.description, url: PAGES.about.path },
}

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: AUTHOR.name,
  jobTitle: AUTHOR.role,
  worksFor: { '@type': 'Organization', name: AUTHOR.company },
  address: { '@type': 'PostalAddress', addressLocality: 'Dhaka', addressCountry: 'BD' },
  url: AUTHOR.site,
  sameAs: [AUTHOR.site, AUTHOR.github, AUTHOR.linkedin],
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-6">
      <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-dim">{children}</div>
    </section>
  )
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />

      <PageIntro heading={PAGES.about.heading}>
        <p>
          This started as a spreadsheet problem. Costing a production support agent meant working out, by hand, how
          many tokens a conversation really used: the system prompt on every call, retrieval on every turn, the
          history sent back again and again, photos charged repeatedly, and a language that fragments badly under
          every tokenizer.
        </p>
        <p>
          The arithmetic was deterministic but tedious, and it went stale the moment a provider changed a rate. So it
          became a calculator.
        </p>
      </PageIntro>

      <div className="max-w-2xl space-y-6">
        <Section title="What it does differently">
          <p>
            Most token calculators multiply a word count by a rate. That answers the wrong question, because the
            tokens you pay for are not the ones you sent.
          </p>
          <ul className="ml-4 list-disc space-y-1.5">
            <li>Earlier turns go back to the model on every reply, so cost per message rises through a conversation.</li>
            <li>An image stays in the transcript and is charged again on each later turn.</li>
            <li>Providers count images differently: by tile, by patch up to a ceiling, or at a flat rate.</li>
            <li>The same sentence in Bangla or Hindi costs roughly half as much again as it does in English.</li>
            <li>Prompt caching and batch pricing change the answer, and by less than people assume.</li>
          </ul>
          <p>
            Every figure is shown with its working, so you can check the arithmetic rather than trust it. Rates for
            all {BUILTIN_MODELS.length} models are editable, because published prices drift and public aggregators
            disagree with each other.
          </p>
        </Section>

        <Section title="How it is built">
          <p>
            Next.js with static export, so there is no backend and nothing you type leaves your browser. Tokenization
            runs locally through the OpenAI tokenizers, which are the only ones available client side. Your
            assumptions live in the URL, which is why a link carries a whole scenario.
          </p>
          <p>
            The calculation layer is pure TypeScript with no React in it, covered by tests that pin the arithmetic to
            worked examples so a rate update cannot quietly change the maths.
          </p>
        </Section>

        <Section title="Who made it">
          <p>
            <a href={AUTHOR.site} className="font-medium text-ink hover:text-brand" rel="me">
              {AUTHOR.name}
            </a>
            , a {AUTHOR.role.toLowerCase()} at {AUTHOR.company} in {AUTHOR.location}, working on GenAI backends,
            RAG chatbots and agentic systems. toktrics came out of costing one of those systems for production.
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1.5">
            <a href={AUTHOR.site} className="text-brand hover:underline">
              rayhanpervej.me
            </a>
            <a href={AUTHOR.github} className="text-brand hover:underline">
              GitHub
            </a>
            <a href={AUTHOR.linkedin} className="text-brand hover:underline">
              LinkedIn
            </a>
            <a href={`mailto:${AUTHOR.email}`} className="text-brand hover:underline">
              Email
            </a>
          </p>
        </Section>

        <Section title="A caveat worth repeating">
          <p>
            Rates move, and the aggregators that publish them disagree. Check a provider&rsquo;s own pricing page before
            you quote a figure from here, and treat the language ratios as a guide to how scripts compare rather than
            an exact count for every model.
          </p>
        </Section>
      </div>
    </>
  )
}
