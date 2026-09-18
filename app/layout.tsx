import type { Metadata } from 'next'
import Script from 'next/script'
import { Roboto, Roboto_Mono } from 'next/font/google'
import { Suspense } from 'react'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-roboto-mono',
  display: 'swap',
})
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Brand } from '@/components/ui/Brand'
import { Footer } from '@/components/ui/Footer'
import { TabNav } from '@/components/ui/TabNav'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'LLM cost calculator',
    'token cost calculator',
    'AI API pricing',
    'GPT pricing',
    'Claude pricing',
    'Gemini pricing',
    'tokens per message',
    'LLM pricing comparison',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} · ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} · ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${roboto.variable} ${robotoMono.variable}`}>
      <body className="min-h-screen">
        {/* Applies the stored theme before paint, so there is no flash of the wrong one. */}
        <Script id="theme" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('toktrics.v1.theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}`}
        </Script>
        <NuqsAdapter>
          <div className="border-b border-line bg-panel">
            <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-5 py-3.5 sm:gap-6 sm:px-8">
              <Suspense fallback={null}>
                <div className="shrink-0">
                  <Brand />
                </div>
              </Suspense>
              <div className="flex items-center gap-1">
                <Suspense fallback={null}>
                  <TabNav />
                </Suspense>
                <ThemeToggle />
              </div>
            </div>
          </div>
          <main className="mx-auto max-w-[1200px] px-5 py-7 sm:px-8">{children}</main>
          <Footer />
        </NuqsAdapter>
      </body>
    </html>
  )
}
