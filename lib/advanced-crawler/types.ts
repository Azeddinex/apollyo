/**
 * Advanced Crawler Types
 * Type definitions for the advanced crawler system
 */

export interface CrawlConfig {
  urls: string[]
  maxDepth: number
  maxResults: number
  filters: FilterConfig
  enableStealth: boolean
  enableSemanticAnalysis: boolean
  enableLearning?: boolean
}

export interface FilterConfig {
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
  rarity?: {
    min: number
    max: number
  }
  marketPotential?: {
    min: number
  }
  linguistic?: {
    allowCompounds?: boolean
    requireVowels?: boolean
    maxConsonantCluster?: number
  }
}

export interface CrawlResult {
  url: string
  data: string
  confidence: number
  semanticQuality?: number
  coherence?: number
  contextRelevance?: number
  metadata: Record<string, any>
  extractedAt: string
}

export interface FilterAgent {
  name: string
  priority: number
  isActive: boolean
  apply(data: any, context: any): Promise<FilterResult>
  learn(data: any, feedback: boolean, context?: any): void
  getStats(): FilterStats
}

export interface FilterResult {
  passed: boolean
  confidence: number
  reason?: string
}

export interface FilterStats {
  name: string
  priority: number
  totalProcessed: number
  successful: number
  failed: number
  successRate: number
  avgProcessingTime: number
}

export interface CrawlerStats {
  totalCrawled: number
  totalExtracted: number
  avgConfidence: number
  avgSemanticQuality?: number
  processingTime: number
  filterStats: FilterStats[]
}

export interface SemanticAnalysis {
  semanticQuality: number
  coherence: number
  contextRelevance: number
  anomalyLevel: number
}

export enum DataType {
  TEXT = 'text',
  URL = 'url',
  EMAIL = 'email',
  PHONE = 'phone',
  IMAGE_URL = 'image_url',
  JSON_DATA = 'json_data',
  CUSTOM = 'custom'
}

export interface ExtractionTarget {
  dataType: DataType
  selectors: string[]
  patterns: RegExp[]
  validationRules?: Record<string, any>
  postProcessors?: Array<(data: any) => any>
}

export interface LearningData {
  data: any
  feedback: boolean
  context: Record<string, any>
  timestamp: number
}

export interface CrawlerMetrics {
  pagesProcessed: number
  dataExtracted: number
  errorsEncountered: number
  totalProcessingTime: number
  avgTimePerPage: number
  successRate: number
}