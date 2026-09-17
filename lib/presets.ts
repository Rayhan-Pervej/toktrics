import type { Assumptions, Tier } from './types'

// A plain chat with no retrieval, images or language uplift. Users switch on
// whatever their own case needs.
export const DEFAULT_ASSUMPTIONS: Assumptions = {
  sessionLength: 8,
  systemPromptTokens: 500,
  userMessageTokens: 50,
  ragChunkCount: 0,
  ragChunkTokens: 500,
  replyTokens: 200,
  toolTokens: 0,
  languageBuffer: 1.3,
  bufferEnabled: false,
  imagesEnabled: false,
  imageWidth: 1280,
  imageHeight: 720,
  imageRate: 0.15,
  resendImagesInHistory: true,
  cacheSystemPrompt: false,
  batchMode: false,
  overheadPerMessage: 0,
}

// Everything zeroed, for building a scenario from scratch. Session length stays
// at 1 because a conversation of zero messages has no cost to model.
export const EMPTY_ASSUMPTIONS: Assumptions = {
  sessionLength: 1,
  systemPromptTokens: 0,
  userMessageTokens: 0,
  ragChunkCount: 0,
  ragChunkTokens: 0,
  replyTokens: 0,
  toolTokens: 0,
  languageBuffer: 1,
  bufferEnabled: false,
  imagesEnabled: false,
  imageWidth: 1280,
  imageHeight: 720,
  imageRate: 0,
  resendImagesInHistory: true,
  cacheSystemPrompt: false,
  batchMode: false,
  overheadPerMessage: 0,
}

// The COST.md scenario, retained as the fixture the golden-master tests assert against.
export const CSA_ASSUMPTIONS: Assumptions = {
  sessionLength: 8,
  systemPromptTokens: 600,
  userMessageTokens: 25,
  ragChunkCount: 3,
  ragChunkTokens: 512,
  replyTokens: 120,
  toolTokens: 60,
  languageBuffer: 1.3,
  bufferEnabled: true,
  imagesEnabled: true,
  imageWidth: 1280,
  imageHeight: 720,
  imageRate: 0.15,
  resendImagesInHistory: true,
  cacheSystemPrompt: false,
  batchMode: false,
  overheadPerMessage: 0.000051,
}

export const DEFAULT_TIERS: Tier[] = [
  { name: 'Low volume', messagesPerMonth: 3000 },
  { name: 'Medium volume', messagesPerMonth: 15000 },
  { name: 'High volume', messagesPerMonth: 50000 },
]
