import { describe, expect, it } from 'vitest'
import { assumptionsToQuery, pruneDisabled, queryToAssumptions } from './url'
import { DEFAULT_ASSUMPTIONS } from './presets'

const q = (a = DEFAULT_ASSUMPTIONS) => pruneDisabled(a, assumptionsToQuery(a))

describe('url state', () => {
  it('round-trips assumptions', () => {
    const a = { ...DEFAULT_ASSUMPTIONS, sessionLength: 12, systemPromptTokens: 900 }
    expect(queryToAssumptions(assumptionsToQuery(a))).toEqual(a)
  })

  it('clears the buffer value when the language switch is off', () => {
    const on = q({ ...DEFAULT_ASSUMPTIONS, bufferEnabled: true, languageBuffer: 1.54 })
    expect(on.buf).toBe(1.54)

    const off = q({ ...DEFAULT_ASSUMPTIONS, bufferEnabled: false, languageBuffer: 1.54 })
    expect(off.buf).toBeNull()
  })

  it('clears image settings when images are off', () => {
    const on = q({ ...DEFAULT_ASSUMPTIONS, imagesEnabled: true, imageWidth: 1920, imageHeight: 1080 })
    expect(on.iw).toBe(1920)
    expect(on.ih).toBe(1080)

    const off = q({ ...DEFAULT_ASSUMPTIONS, imagesEnabled: false, imageWidth: 1920, imageHeight: 1080 })
    expect(off.iw).toBeNull()
    expect(off.ih).toBeNull()
    expect(off.ir).toBeNull()
    expect(off.imgHist).toBeNull()
  })

  it('leaves unrelated settings alone', () => {
    const off = q({ ...DEFAULT_ASSUMPTIONS, bufferEnabled: false, sessionLength: 20 })
    expect(off.n).toBe(20)
    expect(off.sys).toBe(DEFAULT_ASSUMPTIONS.systemPromptTokens)
  })
})
