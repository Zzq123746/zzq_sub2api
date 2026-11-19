/** Homepage editorial catalog, not a list of enabled site models.
 * Sources are for maintainers only; no external links are rendered on cards.
 * Set pricing to { input, output } in USD per million tokens when ready.
 * null means unpriced, never free. This display configuration does not change billing.
 */
export const homeModelFamilies = ['gpt', 'claude', 'gemini'] as const
export type HomeModelFamily = typeof homeModelFamilies[number]

export interface HomeModelCard {
  id: string
  family: HomeModelFamily
  provider: string
  descriptionKey: string
  tagKeys: readonly string[]
  pricing: { input: number; output: number } | null
  source: string
  verifiedAt: string
}

export const HOME_MODEL_CATALOG_DATE = '2026-11-18'
export const homeModelCatalog: readonly HomeModelCard[] = [
  {
    id: 'gpt-6-astra', family: 'gpt', provider: 'OpenAI',
    descriptionKey: 'homeModels.descriptions.gpt_6_astra',
    tagKeys: ["homeModels.tags.deep_reasoning", "homeModels.tags.research_writing"],
    pricing: null, source: 'https://developers.openai.com/api/docs/models/gpt-6-astra.md', verifiedAt: HOME_MODEL_CATALOG_DATE,
  },
  {
    id: 'gpt-6.1-sol', family: 'gpt', provider: 'OpenAI',
    descriptionKey: 'homeModels.descriptions.gpt_6_1_sol',
    tagKeys: ["homeModels.tags.complex_coding", "homeModels.tags.tool_use"],
    pricing: null, source: 'https://developers.openai.com/api/docs/models/gpt-6.1-sol.md', verifiedAt: HOME_MODEL_CATALOG_DATE,
  },
  {
    id: 'gpt-6.1-terra', family: 'gpt', provider: 'OpenAI',
    descriptionKey: 'homeModels.descriptions.gpt_6_1_terra',
    tagKeys: ["homeModels.tags.visual_understanding", "homeModels.tags.natural_writing"],
    pricing: null, source: 'https://developers.openai.com/api/docs/models/gpt-6.1-terra.md', verifiedAt: HOME_MODEL_CATALOG_DATE,
  },
  {
    id: 'gpt-6-luna', family: 'gpt', provider: 'OpenAI',
    descriptionKey: 'homeModels.descriptions.gpt_6_luna',
    tagKeys: ["homeModels.tags.high_volume_tasks", "homeModels.tags.structured_output"],
    pricing: null, source: 'https://developers.openai.com/api/docs/models/gpt-6-luna.md', verifiedAt: HOME_MODEL_CATALOG_DATE,
  },
  {
    id: 'gpt-5.6-sol', family: 'gpt', provider: 'OpenAI',
    descriptionKey: 'homeModels.descriptions.gpt_5_6_sol',
    tagKeys: ["homeModels.tags.complex_tasks", "homeModels.tags.long_context"],
    pricing: null, source: 'https://developers.openai.com/api/docs/models/gpt-5.6-sol.md', verifiedAt: HOME_MODEL_CATALOG_DATE,
  },
  {
    id: 'claude-opus-5-5', family: 'claude', provider: 'Anthropic',
    descriptionKey: 'homeModels.descriptions.claude_opus_5_5',
    tagKeys: ["homeModels.tags.code_engineering", "homeModels.tags.agent_workflows"],
    pricing: null, source: 'https://platform.claude.com/docs/en/models/opus-5-5/overview', verifiedAt: HOME_MODEL_CATALOG_DATE,
  },
  {
    id: 'claude-sonnet-5-5', family: 'claude', provider: 'Anthropic',
    descriptionKey: 'homeModels.descriptions.claude_sonnet_5_5',
    tagKeys: ["homeModels.tags.coding", "homeModels.tags.data_analysis"],
    pricing: null, source: 'https://platform.claude.com/docs/en/models/sonnet-5-5/overview', verifiedAt: HOME_MODEL_CATALOG_DATE,
  },
  {
    id: 'gemini-4-carbon', family: 'gemini', provider: 'Google',
    descriptionKey: 'homeModels.descriptions.gemini_4_carbon',
    tagKeys: ["homeModels.tags.multimodal_input", "homeModels.tags.complex_reasoning"],
    pricing: null, source: 'https://aistudio.google.com/docs/models/gemini-4-carbon', verifiedAt: HOME_MODEL_CATALOG_DATE,
  },
]
