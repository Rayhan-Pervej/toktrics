import Link from 'next/link'
import { AUTHOR, PAGES, RATES_NOTE_SHORT } from '@/lib/site'

const PAGE_LINKS = [
  { href: PAGES.home.path, label: 'Calculator' },
  { href: PAGES.languages.path, label: 'Languages' },
  { href: PAGES.models.path, label: 'Models' },
  { href: PAGES.about.path, label: 'About' },
]

const SOCIAL_LINKS = [
  { href: AUTHOR.site, label: 'Portfolio' },
  { href: AUTHOR.github, label: 'GitHub' },
  { href: AUTHOR.linkedin, label: 'LinkedIn' },
  { href: `mailto:${AUTHOR.email}`, label: 'Email' },
]

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto max-w-[1200px] px-5 py-7 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
          <div className="max-w-md">
            <span className="text-[15px] font-semibold tracking-tight">toktrics</span>
            <p className="mt-2 text-xs leading-relaxed text-faint">{RATES_NOTE_SHORT}</p>
          </div>

          <nav className="flex flex-wrap gap-x-4 gap-y-1.5 sm:justify-end">
            {PAGE_LINKS.map((l) => (
              <Link key={l.label} href={l.href} className="text-[13px] text-dim hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-line-soft pt-4 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              © {new Date().getFullYear()}{' '}
              <a href={AUTHOR.site} className="hover:text-ink" rel="me">
                {AUTHOR.name}
              </a>
            </span>
            <span aria-hidden="true" className="text-line">
              |
            </span>
            {SOCIAL_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="hover:text-ink">
                {l.label}
              </a>
            ))}
          </span>
          <span>Runs entirely in your browser, so nothing you enter is sent anywhere.</span>
        </div>
      </div>
    </footer>
  )
}
