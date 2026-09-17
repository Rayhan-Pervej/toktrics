# toktrics

An LLM cost calculator that works out what a feature actually costs per message, rather than multiplying a word count by a rate.

Rate cards tell you the price per million tokens. They do not tell you what a conversation costs, because the tokens you pay for are not the ones you sent.

## What it counts that a rate table does not

- **Resent history.** Earlier turns go back to the model on every reply, so cost per message climbs through a conversation.
- **Repeated images.** A photo stays in the transcript and is charged again on each later turn. Its arrival turn is unknown, so the model uses the mean billing count across all arrival positions.
- **Image tokenization per provider.** Tiles at 768px, patches of 32px capped at a ceiling, or a flat rate per picture. Two models with similar token rates can cost very different amounts once pictures are involved.
- **Tokenizer overhead.** The same sentence in Bangla costs about 1.46 times the English tokens, Hindi about 1.54 times. Chinese lands near parity because each character carries more meaning.
- **Prompt caching and batch pricing**, with each model's own multipliers.

Every figure comes with its working, so the arithmetic can be checked rather than trusted.

## Pages

| Page | What it does |
| :--- | :--- |
| Calculator | Set your assumptions, compare models, see the derivation and what would change the cost most |
| Languages | Measure how the same sentence tokenizes across five languages, then apply the ratio to the cost model |
| Models | Thirty models across twelve providers, every rate editable, tick which ones to compare |
| About | Why the tool exists and how it is built |

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site in out/
npm test           # calculation tests
npm run typecheck
```

Requires Node 20 or newer.

## How it is built

Next.js 16 with `output: 'export'`, so it is a set of static files with no backend. Nothing you type leaves the browser.

- **Assumptions live in the URL**, which is why a link carries a whole scenario.
- **Custom rates and saved scenarios live in localStorage**, so they persist without an account.
- **Tokenization runs locally** through `gpt-tokenizer`, loaded on demand so its several megabytes of BPE tables never reach the calculator page.
- **The calculation layer is pure TypeScript** with no React in it, covered by tests that pin the arithmetic to worked examples so a rate change cannot quietly alter the maths.

```
app/           routes, metadata, sitemap, generated icon and social image
components/    calculator, tokenizer, registry, shared primitives
lib/           the calculation layer, zero React
  cost.ts        the model: history, images, buffer, caching, batch
  images.ts      per-provider image tokenization
  sensitivity.ts what changes the cost most, computed from declarative levers
  pricing.ts     margin and volume arithmetic
  tokenizer/     encodings, lazy loader, language measurement
data/          bundled model rates
```

## The cost model

```
avgHistory    = mean over i in [0, N) of i * (userTokens + replyTokens)
textInput     = systemPrompt + userTokens + ragChunks * ragChunkTokens + avgHistory
bufferedInput = textInput * languageBuffer
avgImageBills = imagesStayInHistory ? (N + 1) / 2 : 1
imageTokens   = tokensPerImage(provider, width, height) * avgImageBills * imageRate
output        = (replyTokens + toolTokens) * languageBuffer
cost          = (bufferedInput + imageTokens) / 1e6 * rateIn
              + output / 1e6 * rateOut
              + otherCosts
```

Two things worth knowing. The language buffer multiplies text only, since image tokens derive from pixels rather than words. And images are billed an average of 4.5 times across an eight message conversation, because a photo is resent on every later turn and its arrival turn is unknown.

## Caveats

- **Rates drift and public aggregators disagree with each other.** Check a provider's own pricing page before quoting a figure from here. Every rate in the app is editable for that reason.
- **A few output rates are estimated.** Where a provider published only an input rate, the output rate is estimated at four times input and labelled as such in the model list.
- **Language ratios use OpenAI tokenizers**, the only ones that run in a browser. They are a reliable guide to how scripts compare, not an exact count for every model.
- **Token figures are assumptions, not measurements** from your production traffic.

## Licence

MIT
