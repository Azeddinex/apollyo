# apollyo API Documentation

Complete API reference for apollyo endpoints.

## Base URL

\`\`\`
Development: http://localhost:3000/api
Production: https://apollyo.com/api
\`\`\`

## Authentication

Currently, no authentication is required. OpenAI API keys are optional and user-provided.

## Endpoints

### POST /api/search

Search for words using Speed Mode or Hyper Mode.

#### Request

**Headers**:
\`\`\`
Content-Type: application/json
\`\`\`

**Body**:
\`\`\`typescript
{
  mode: 'speed' | 'hyper',
  filters: {
    // Basic filters
    minLength?: number,           // 1-20, default: 3
    maxLength?: number,           // 1-20, default: 10
    startsWith?: string,          // Pattern to start with
    endsWith?: string,            // Pattern to end with
    contains?: string,            // Pattern to contain
    excludes?: string,            // Pattern to exclude
    
    // Phonetic filters
    vowelRatio?: number,          // 0-1, default: 0.4
    allowDoubleConsonants?: boolean,
    
    // Advanced filters (Hyper Mode only)
    rarityThreshold?: number,     // 0-1, default: 0.3
    marketPotential?: number,     // 0-1, default: 0.5
    pronunciationDifficulty?: 'easy' | 'medium' | 'hard',
    minSyllables?: number,        // 1-10
    maxSyllables?: number,        // 1-10
    memorability?: number,        // 0-1
    brandability?: number,        // 0-1
    
    // Linguistic options
    allowCompounds?: boolean,
    requireVowelStart?: boolean,
    requireConsonantEnd?: boolean,
    allowConsonantClusters?: boolean,
    
    // Quality control
    minConfidence?: number,       // 0-1, default: 0.6
    requireNaturalFlow?: boolean,
    excludeGibberish?: boolean,
    
    // Phonetic preferences
    preferredSounds?: string[],
    avoidedSounds?: string[],
    rhythmPattern?: 'iambic' | 'trochaic' | 'any',
    
    // Domain categories (Hyper Mode only)
    domainCategories?: string[]   // See categories list below
  },
  maxResults: number,             // 1-5000, default: 100
  crawlDepth?: number,            // 1-5, Hyper Mode only, default: 3
  openaiKey?: string              // Optional OpenAI API key
}
\`\`\`

#### Response

**Success (200)**:
\`\`\`typescript
{
  success: true,
  results: [
    {
      word: string,
      length: number,
      rarity: number,              // 0-1
      marketPotential: number,     // 0-1
      confidence: number,          // 0-1
      memorability: number,        // 0-1
      brandability: number,        // 0-1
      syllables: number,
      pronunciation: string,
      sources: string[],
      metadata: {
        phonetic: string,
        pattern: string,
        category?: string,
        discovered: string         // ISO date
      }
    }
  ],
  metadata: {
    totalFound: number,
    processingTime: number,        // milliseconds
    strategy: string,
    mode: 'speed' | 'hyper',
    filtersApplied: number,
    duplicatesRemoved: number
  }
}
\`\`\`

**Error (400 - Bad Request)**:
\`\`\`typescript
{
  success: false,
  error: string,
  details?: {
    field: string,
    message: string
  }[]
}
\`\`\`

**Error (408 - Request Timeout)**:
\`\`\`typescript
{
  success: false,
  error: "Request timeout after 2 minutes"
}
\`\`\`

**Error (500 - Internal Server Error)**:
\`\`\`typescript
{
  success: false,
  error: string,
  stack?: string  // Only in development
}
\`\`\`

#### Examples

**Speed Mode - Basic Search**:
\`\`\`bash
curl -X POST https://apollyo.com/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "speed",
    "filters": {
      "minLength": 5,
      "maxLength": 8,
      "startsWith": "app"
    },
    "maxResults": 50
  }'
\`\`\`

**Hyper Mode - Advanced Search**:
\`\`\`bash
curl -X POST https://apollyo.com/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "hyper",
    "filters": {
      "minLength": 6,
      "maxLength": 10,
      "rarityThreshold": 0.7,
      "marketPotential": 0.8,
      "brandability": 0.9,
      "domainCategories": ["technology", "business"]
    },
    "maxResults": 100,
    "crawlDepth": 4
  }'
\`\`\`

**With OpenAI Enhancement**:
\`\`\`bash
curl -X POST https://apollyo.com/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "hyper",
    "filters": {
      "minLength": 7,
      "maxLength": 12,
      "rarityThreshold": 0.8
    },
    "maxResults": 200,
    "openaiKey": "sk-..."
  }'
\`\`\`

### POST /api/validate

Validate a single word using Internal Intelligence Agent.

#### Request

\`\`\`typescript
{
  word: string,
  strictness?: 'low' | 'medium' | 'high'  // default: 'medium'
}
\`\`\`

#### Response

\`\`\`typescript
{
  valid: boolean,
  word: string,
  confidence: number,
  rarity: number,
  marketPotential: number,
  analysis: {
    phonetic: string,
    syllables: number,
    pattern: string,
    issues?: string[]
  }
}
\`\`\`

## Domain Categories

Available categories for Hyper Mode filtering:

\`\`\`typescript
[
  'technology',
  'business',
  'health',
  'education',
  'finance',
  'entertainment',
  'sports',
  'travel',
  'food-beverage',
  'fashion',
  'real-estate',
  'automotive',
  'gaming',
  'social',
  'ecommerce',
  'saas',
  'consulting',
  'creative',
  'general'
]
\`\`\`

## Rate Limits

Currently no rate limits. Future implementation planned:

\`\`\`
Free tier: 100 requests/hour
Pro tier: 1000 requests/hour
Enterprise: Unlimited
\`\`\`

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid request parameters |
| 408 | Request timeout (>2 minutes) |
| 429 | Rate limit exceeded (future) |
| 500 | Internal server error |
| 503 | Service temporarily unavailable |

## Best Practices

1. **Start with Speed Mode** for quick exploration
2. **Use Hyper Mode** for serious projects
3. **Narrow filters gradually** to avoid empty results
4. **Set reasonable maxResults** (50-200 recommended)
5. **Use crawlDepth wisely** (higher = slower but better)
6. **Provide OpenAI key** for enhanced results (optional)
7. **Handle timeouts gracefully** (2-minute limit)

## SDK (Future)

JavaScript/TypeScript SDK coming soon:

\`\`\`typescript
import { Apollyo } from 'apollyo-sdk';

const client = new Apollyo({
  apiKey: 'your-api-key'
});

const results = await client.search({
  mode: 'hyper',
  filters: {
    minLength: 6,
    rarityThreshold: 0.8
  }
});
\`\`\`

## Webhooks (Future)

Subscribe to events:

\`\`\`typescript
{
  event: 'search.completed',
  url: 'https://your-app.com/webhook',
  filters: { ... }
}
\`\`\`

## Support

For API support:
- Email: admin@apollyo.com
- GitHub Issues: https://github.com/apollyo/apollyo/issues
- Documentation: https://apollyo.com/docs

---

**Last Updated**: 2025-01-13
