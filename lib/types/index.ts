export type OperationMode = "speed" | "hyper"

export type FilterType =
  | "length"
  | "pattern"
  | "rarity"
  | "marketPotential"
  | "pronunciation"
  | "memorability"
  | "linguistic"
  | "phonetic"
  | "semantic"
  | "brandability"
  | "domainCategory"

export type FlexibleFilters = {
  length?: {
    min: number
    max: number
  }
  pattern?: {
    startsWith?: string
    endsWith?: string
    contains?: string
    excludes?: string
  }
  phonetic?: {
    vowelRatio?: {
      min: number
      max: number
    }
    allowDoubleConsonants?: boolean
  }
}

export type DomainCategory =
  | "technology"
  | "business"
  | "health"
  | "education"
  | "finance"
  | "entertainment"
  | "sports"
  | "travel"
  | "food"
  | "fashion"
  | "real-estate"
  | "automotive"
  | "gaming"
  | "social"
  | "ecommerce"
  | "saas"
  | "consulting"
  | "creative"
  | "general"

export type AdvancedFilters = FlexibleFilters & {
  rarity?: {
    min: number
    max: number
  }
  marketPotential?: {
    min: number
  }
  pronunciation?: {
    difficulty: "easy" | "medium" | "hard" | "any"
    syllableCount?: {
      min: number
      max: number
    }
  }
  memorability?: {
    min: number
  }
  linguistic?: {
    allowCompounds: boolean
    requireVowels: boolean
    maxConsonantCluster: number
    preferredPrefixes?: string[]
    preferredSuffixes?: string[]
  }
  semantic?: {
    categories?: string[]
    excludeCategories?: string[]
    sentiment?: "positive" | "neutral" | "negative" | "any"
  }
  brandability?: {
    minScore: number
    requireUnique: boolean
    checkTrademark: boolean
    domainAvailability?: boolean
  }
  phonetic?: {
    vowelRatio?: {
      min: number
      max: number
    }
    allowDoubleConsonants?: boolean
    preferredSounds?: string[]
    avoidSounds?: string[]
    rhythmPattern?: string
  }
  quality?: {
    minConfidence: number
    requireNaturalFlow: boolean
    excludeGibberish: boolean
  }
  domainCategory?: DomainCategory[]
}

export type WordResult = {
  word: string
  source: "generated" | "crawled"
  scores: {
    rarity: number
    marketPotential: number
    confidence: number
    overall: number
    brandability?: number
    memorability?: number
    pronunciation?: number
  }
  metadata: {
    length: number
    patterns: string[]
    validation: ValidationResult
    sources?: string[]
    count?: number
    syllables?: number
    phonetic?: string
    category?: string
  }
}

export type ValidationResult = {
  isValid: boolean
  confidence: number
  issues: string[]
  suggestions: string[]
}

export type SearchConfig = {
  mode: OperationMode
  filters: FlexibleFilters | AdvancedFilters
  maxResults: number
  depth?: number
}
