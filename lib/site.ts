// Change this to the real domain once it is decided; everything else follows.
export const SITE_URL = 'https://toktrics.com'

export const SITE_NAME = 'toktrics'
export const SITE_TAGLINE = 'LLM cost calculator'

export const SITE_DESCRIPTION =
  'Work out what an LLM feature really costs per message. Counts resent conversation history, images charged again each turn, prompt caching and tokenizer overhead across 30 models.'

export const RATES_NOTE_SHORT =
  "Rates move and public aggregators disagree. Check a provider's own pricing page before quoting a figure from here."

export const PAGES = {
  home: {
    path: '/',
    title: 'LLM cost calculator',
    heading: 'What does your LLM feature cost per message?',
    description: SITE_DESCRIPTION,
  },
  languages: {
    path: '/tokenizer',
    title: 'Languages',
    heading: 'The same sentence, five languages',
    description:
      'See how many tokens the same sentence costs in English, Bangla, Hindi, Japanese and Chinese, and turn the difference into a multiplier for your cost model.',
  },
  about: {
    path: '/about',
    title: 'About',
    heading: 'Why this exists',
    description:
      'toktrics started as a hand-written cost analysis for a production support agent. Built by Rayhan Pervej, a solution developer in Dhaka working on GenAI backends and agentic systems.',
  },
  models: {
    path: '/models',
    title: 'Models',
    heading: 'LLM pricing, thirty models compared',
    description:
      'Input and output rates for thirty models from Anthropic, OpenAI, Google, xAI, DeepSeek and more, with the image tokenization each provider uses.',
  },
} as const

export const AUTHOR = {
  name: 'Rayhan Pervej',
  role: 'Junior Solution Developer',
  company: 'Shadhin Lab LLC',
  location: 'Dhaka, Bangladesh',
  site: 'https://www.rayhanpervej.me',
  github: 'https://github.com/Rayhan-Pervej',
  linkedin: 'https://linkedin.com/in/rayhanpervej',
  email: 'rayhanpervej12@gmail.com',
}
