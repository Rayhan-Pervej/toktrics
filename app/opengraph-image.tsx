import { ImageResponse } from 'next/og'
import { SITE_DESCRIPTION } from '@/lib/site'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const dynamic = 'force-static'
export const alt = 'toktrics, an LLM cost calculator'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0b0c0f',
          padding: 72,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <div style={{ fontSize: 34, fontWeight: 700, color: '#eceef2' }}>toktrics</div>
          <div style={{ fontSize: 22, color: '#9aa3b2' }}>LLM cost calculator</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 26, color: '#9aa3b2' }}>Cost per message</div>
          <div style={{ fontSize: 104, fontWeight: 700, color: '#eceef2', lineHeight: 1 }}>$0.004850</div>
          <div style={{ fontSize: 26, color: '#8b93ff' }}>on Claude Sonnet 5</div>
        </div>

        <div style={{ fontSize: 24, color: '#9aa3b2', maxWidth: 940, lineHeight: 1.45 }}>
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    size,
  )
}
