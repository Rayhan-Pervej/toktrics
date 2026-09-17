import type { Metadata } from 'next'
import { Suspense } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Brand } from '@/components/ui/Brand'
import { Footer } from '@/components/ui/Footer'
import { TabNav } from '@/components/ui/TabNav'
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <NuqsAdapter>
          <div className="border-b border-line bg-panel">
            <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-5 py-3.5 sm:gap-6 sm:px-8">
              <Suspense fallback={null}>
                <div className="shrink-0">
                  <Brand />
                </div>
              </Suspense>
              <Suspense fallback={null}>
                <TabNav />
              </Suspense>
            </div>
          </div>
          <main className="mx-auto max-w-[1200px] px-5 py-7 sm:px-8">{children}</main>
          <Footer />
        </NuqsAdapter>
      </body>
    </html>
  )
}
