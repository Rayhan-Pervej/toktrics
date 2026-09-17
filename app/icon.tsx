import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'
export const dynamic = 'force-static'

// Drawn as shapes rather than text, because ImageResponse bundles no bold font
// and a letter renders too thin to read at this size. The stem runs the full
// height with the crossbar a third of the way down and the foot kicking right,
// which is what separates a lowercase t from a cross.
export default function Icon() {
  const violet = '#8b93ff'
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0c0f',
          borderRadius: 8,
        }}
      >
        <div style={{ display: 'flex', position: 'relative', width: 18, height: 22 }}>
          {/* stem, full height */}
          <div style={{ position: 'absolute', left: 4, top: 0, width: 5, height: 19, background: violet, borderRadius: 1 }} />
          {/* crossbar, a third of the way down */}
          <div style={{ position: 'absolute', left: 0, top: 6, width: 14, height: 4, background: violet, borderRadius: 1 }} />
          {/* foot kicking right */}
          <div style={{ position: 'absolute', left: 8, top: 15, width: 6, height: 4, background: violet, borderRadius: 1 }} />
        </div>
      </div>
    ),
    size,
  )
}
