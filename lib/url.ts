import { parseAsArrayOf, parseAsBoolean, parseAsFloat, parseAsInteger, parseAsString } from 'nuqs'
import { DEFAULT_ASSUMPTIONS } from './presets'
import type { Assumptions } from './types'

const d = DEFAULT_ASSUMPTIONS

export const assumptionParsers = {
  n: parseAsInteger.withDefault(d.sessionLength),
  sys: parseAsInteger.withDefault(d.systemPromptTokens),
  usr: parseAsInteger.withDefault(d.userMessageTokens),
  rc: parseAsInteger.withDefault(d.ragChunkCount),
  rt: parseAsInteger.withDefault(d.ragChunkTokens),
  rep: parseAsInteger.withDefault(d.replyTokens),
  tool: parseAsInteger.withDefault(d.toolTokens),
  buf: parseAsFloat.withDefault(d.languageBuffer),
  bufOn: parseAsBoolean.withDefault(d.bufferEnabled),
  imgOn: parseAsBoolean.withDefault(d.imagesEnabled),
  iw: parseAsInteger.withDefault(d.imageWidth),
  ih: parseAsInteger.withDefault(d.imageHeight),
  ir: parseAsFloat.withDefault(d.imageRate),
  imgHist: parseAsBoolean.withDefault(d.resendImagesInHistory),
  cache: parseAsBoolean.withDefault(d.cacheSystemPrompt),
  batch: parseAsBoolean.withDefault(d.batchMode),
  ovh: parseAsFloat.withDefault(d.overheadPerMessage),
}

export const modelParser = parseAsString.withDefault('claude-sonnet-5')
export const volumeParser = parseAsInteger.withDefault(10_000)
// Which models the comparison shows. Empty means the frontier default set.
export const comparedParser = parseAsArrayOf(parseAsString, ',').withDefault([])

type QueryShape = { [K in keyof typeof assumptionParsers]: ReturnType<(typeof assumptionParsers)[K]['parseServerSide']> }

export function queryToAssumptions(q: QueryShape): Assumptions {
  return {
    sessionLength: q.n,
    systemPromptTokens: q.sys,
    userMessageTokens: q.usr,
    ragChunkCount: q.rc,
    ragChunkTokens: q.rt,
    replyTokens: q.rep,
    toolTokens: q.tool,
    languageBuffer: q.buf,
    bufferEnabled: q.bufOn,
    imagesEnabled: q.imgOn,
    imageWidth: q.iw,
    imageHeight: q.ih,
    imageRate: q.ir,
    resendImagesInHistory: q.imgHist,
    cacheSystemPrompt: q.cache,
    batchMode: q.batch,
    overheadPerMessage: q.ovh,
  }
}

// Settings that only matter while their parent switch is on. Clearing them
// keeps the share link free of values the app is not using.
const DEPENDENT_PARAMS = {
  bufferEnabled: ['buf'],
  imagesEnabled: ['iw', 'ih', 'ir', 'imgHist'],
} as const

export function pruneDisabled(a: Assumptions, query: QueryShape): QueryShape {
  const pruned: Record<string, unknown> = { ...query }
  for (const [flag, keys] of Object.entries(DEPENDENT_PARAMS)) {
    if (a[flag as keyof Assumptions]) continue
    for (const key of keys) pruned[key] = null
  }
  return pruned as QueryShape
}

export function assumptionsToQuery(a: Assumptions): QueryShape {
  return {
    n: a.sessionLength,
    sys: a.systemPromptTokens,
    usr: a.userMessageTokens,
    rc: a.ragChunkCount,
    rt: a.ragChunkTokens,
    rep: a.replyTokens,
    tool: a.toolTokens,
    buf: a.languageBuffer,
    bufOn: a.bufferEnabled,
    imgOn: a.imagesEnabled,
    iw: a.imageWidth,
    ih: a.imageHeight,
    ir: a.imageRate,
    imgHist: a.resendImagesInHistory,
    cache: a.cacheSystemPrompt,
    batch: a.batchMode,
    ovh: a.overheadPerMessage,
  }
}
