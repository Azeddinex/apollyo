// Enhanced Filters Type Definition
export type EnhancedFilters = {
  length?: {
    min?: number
    max?: number
  }
  patterns?: string[]
  excludePatterns?: string[]
  rarityThreshold?: number
  marketPotentialThreshold?: number
  includeGenerated?: boolean
  includeCrawled?: boolean
}
