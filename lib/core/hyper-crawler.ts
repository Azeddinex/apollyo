import { InternalIntelligenceAgent } from "@/lib/agent/internal-intelligence"
import { SessionManager } from "@/lib/core/session-manager"
import type { AdvancedFilters, WordResult } from "@/lib/types"
import { isLikelyEnglishWord } from "@/lib/data/english-dictionary"

export type CrawlSource = {
  url: string
  type: "dictionary" | "wordlist" | "domain" | "api"
  priority: number
}

export type CrawlResult = {
  words: WordResult[]
  stats: {
    totalCrawled: number
    validWords: number
    sources: string[]
    duration: number
  }
}

export class HyperCrawler {
  private agent: InternalIntelligenceAgent
  private sessionManager: SessionManager
  private crawledCache: Map<string, WordResult>
  private sources: CrawlSource[]
  private allAvailableSources: CrawlSource[]

  constructor() {
    this.agent = new InternalIntelligenceAgent()
    this.sessionManager = new SessionManager()
    this.crawledCache = new Map()
    this.sources = this.initializeSources()
    this.allAvailableSources = this.initializeAllSources()
  }

  private initializeSources(): CrawlSource[] {
    return [
      {
        url: "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt",
        type: "wordlist",
        priority: 1,
      },
      {
        url: "https://www.mit.edu/~ecprice/wordlist.10000",
        type: "wordlist",
        priority: 2,
      },
    ]
  }

  private initializeAllSources(): CrawlSource[] {
    return [
      ...this.sources,
      {
        url: "https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-usa.txt",
        type: "wordlist",
        priority: 3,
      },
      {
        url: "https://raw.githubusercontent.com/bitcoin/bips/master/bip-0039/english.txt",
        type: "wordlist",
        priority: 4,
      },
    ]
  }

  public async crawl(filters: AdvancedFilters, maxResults = 5000, depth = 3): Promise<CrawlResult> {
    const startTime = Date.now()
    const allWords = new Map<string, WordResult>()
    const sourcesUsed = new Set<string>()

    console.log("[v0] Starting Hyper Crawler with adaptive strategy...")

    const strategy = this.sessionManager.getAdaptiveStrategy()
    console.log("[v0] Using adaptive strategy:", strategy.name)

    const selectedSources = this.selectSourcesAdaptively(strategy, depth)
    const adjustedDepth = this.adjustDepthAdaptively(strategy, depth)

    for (const source of selectedSources.slice(0, adjustedDepth)) {
      try {
        console.log("[v0] Crawling source:", source.url)
        const words = await this.crawlSource(source, filters)

        const newWords = words.filter((w) => !this.sessionManager.isWordReturned(w.word))

        newWords.forEach((word) => {
          if (!allWords.has(word.word)) {
            allWords.set(word.word, word)
          } else {
            const existing = allWords.get(word.word)!
            existing.metadata.sources = [...(existing.metadata.sources || []), ...(word.metadata.sources || [])]
            existing.metadata.count = (existing.metadata.count || 1) + 1
          }
        })

        sourcesUsed.add(source.url)
        console.log("[v0] Crawled", newWords.length, "new words from", source.url)
      } catch (error) {
        console.error("[v0] Error crawling source:", source.url, error)
      }
    }

    const filteredWords = this.applyAdvancedFilters(Array.from(allWords.values()), filters)

    const sortedWords = this.sortWithDiversity(filteredWords, strategy).slice(0, maxResults)

    this.sessionManager.recordSearch(
      "hyper",
      filters,
      sortedWords.map((w) => w.word),
      Array.from(sourcesUsed),
    )

    const success = sortedWords.length >= maxResults * 0.5
    this.sessionManager.updateStrategySuccess(strategy.name, success)

    const duration = Date.now() - startTime

    console.log("[v0] Hyper Crawler completed:", {
      totalCrawled: allWords.size,
      validWords: sortedWords.length,
      strategy: strategy.name,
      duration: `${duration}ms`,
    })

    return {
      words: sortedWords,
      stats: {
        totalCrawled: allWords.size,
        validWords: sortedWords.length,
        sources: Array.from(sourcesUsed),
        duration,
      },
    }
  }

  private selectSourcesAdaptively(strategy: any, depth: number): CrawlSource[] {
    if (strategy.name === "source_rotation") {
      const sourceUrls = this.allAvailableSources.map((s) => s.url)
      const leastUsed = this.sessionManager.getLeastUsedSources(sourceUrls, depth + 2)
      return this.allAvailableSources.filter((s) => leastUsed.includes(s.url))
    }

    if (strategy.name === "time_based_variation") {
      const hour = new Date().getHours()
      const offset = hour % this.allAvailableSources.length
      return [...this.allAvailableSources.slice(offset), ...this.allAvailableSources.slice(0, offset)]
    }

    return this.allAvailableSources.sort((a, b) => a.priority - b.priority)
  }

  private adjustDepthAdaptively(strategy: any, baseDepth: number): number {
    if (strategy.name === "depth_adjustment") {
      return Math.min(baseDepth + 1, this.allAvailableSources.length)
    }
    return baseDepth
  }

  private sortWithDiversity(words: WordResult[], strategy: any): WordResult[] {
    if (strategy.name === "pattern_variation") {
      const patternGroups = new Map<string, WordResult[]>()

      words.forEach((word) => {
        const pattern = word.metadata.patterns?.[0] || "unknown"
        if (!patternGroups.has(pattern)) {
          patternGroups.set(pattern, [])
        }
        patternGroups.get(pattern)!.push(word)
      })

      const diverseWords: WordResult[] = []
      const maxPerPattern = Math.ceil(words.length / patternGroups.size)

      patternGroups.forEach((group) => {
        const sorted = group.sort((a, b) => b.scores.overall - a.scores.overall)
        diverseWords.push(...sorted.slice(0, maxPerPattern))
      })

      return diverseWords.sort((a, b) => b.scores.overall - a.scores.overall)
    }

    return words.sort((a, b) => b.scores.overall - a.scores.overall)
  }

  private async crawlSource(source: CrawlSource, filters: AdvancedFilters): Promise<WordResult[]> {
    const words: WordResult[] = []

    try {
      const response = await fetch(source.url)
      const text = await response.text()
      const lines = text.split("\n")

      for (const line of lines) {
        const word = line.trim().toLowerCase()

        if (!this.passesBasicFilters(word, filters)) {
          continue
        }

        const validation = this.agent.validateEnglishWord(word)

        if (validation.isValid) {
          const wordResult: WordResult = {
            word,
            source: "crawled",
            scores: {
              rarity: validation.rarityScore,
              marketPotential: validation.marketPotential,
              confidence: validation.confidence,
              overall: this.calculateOverallScore(validation),
            },
            metadata: {
              length: word.length,
              patterns: this.extractPatterns(word),
              validation,
              sources: [source.url],
              count: 1,
            },
          }

          words.push(wordResult)
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching from source:", error)
    }

    return words
  }

  private passesBasicFilters(word: string, filters: AdvancedFilters): boolean {
    if (!isLikelyEnglishWord(word)) {
      return false
    }

    if (filters.length) {
      const { min = 3, max = 12 } = filters.length
      if (word.length < min || word.length > max) {
        return false
      }
    }

    if (filters.pattern) {
      if (filters.pattern.startsWith && !word.startsWith(filters.pattern.startsWith)) {
        return false
      }
      if (filters.pattern.endsWith && !word.endsWith(filters.pattern.endsWith)) {
        return false
      }
      if (filters.pattern.contains && !word.includes(filters.pattern.contains)) {
        return false
      }
    }

    if (filters.linguistic) {
      if (filters.linguistic.requireVowels) {
        if (!/[aeiou]/i.test(word)) {
          return false
        }
      }

      if (filters.linguistic.maxConsonantCluster) {
        const consonantClusters = word.match(/[bcdfghjklmnpqrstvwxyz]{2,}/gi)
        if (consonantClusters) {
          const maxCluster = Math.max(...consonantClusters.map((c) => c.length))
          if (maxCluster > filters.linguistic.maxConsonantCluster) {
            return false
          }
        }
      }
    }

    return true
  }

  private applyAdvancedFilters(words: WordResult[], filters: AdvancedFilters): WordResult[] {
    return words.filter((word) => {
      if (filters.rarity) {
        const { min = 0, max = 1 } = filters.rarity
        if (word.scores.rarity < min || word.scores.rarity > max) {
          return false
        }
      }

      if (filters.marketPotential) {
        const { min = 0 } = filters.marketPotential
        if (word.scores.marketPotential < min) {
          return false
        }
      }

      if (filters.pronunciation) {
        const difficulty = this.calculatePronunciationDifficulty(word.word)
        if (difficulty !== filters.pronunciation.difficulty) {
          return false
        }
      }

      if (filters.memorability) {
        const memorability = this.calculateMemorability(word.word)
        if (memorability < filters.memorability.min) {
          return false
        }
      }

      return true
    })
  }

  private calculateOverallScore(validation: any): number {
    return validation.confidence * 0.3 + validation.rarityScore * 0.4 + validation.marketPotential * 0.3
  }

  private calculatePronunciationDifficulty(word: string): "easy" | "medium" | "hard" {
    const vowels = (word.match(/[aeiou]/gi) || []).length
    const consonantClusters = word.match(/[bcdfghjklmnpqrstvwxyz]{3,}/gi)

    if (consonantClusters && consonantClusters.length > 0) {
      return "hard"
    }

    const vowelRatio = vowels / word.length
    if (vowelRatio >= 0.35 && vowelRatio <= 0.5) {
      return "easy"
    }

    return "medium"
  }

  private calculateMemorability(word: string): number {
    let score = 0

    if (word.length >= 4 && word.length <= 8) score += 0.4
    else if (word.length >= 3 && word.length <= 10) score += 0.2

    const hasPattern = /(.)\1|(..)\2/.test(word)
    if (hasPattern) score += 0.3

    const strongStart = /^[b-df-hj-np-tv-z]/i.test(word)
    const strongEnd = /[aeiou][b-df-hj-np-tv-z]$/i.test(word)
    if (strongStart) score += 0.15
    if (strongEnd) score += 0.15

    return Math.min(1, score)
  }

  private extractPatterns(word: string): string[] {
    const patterns: string[] = []

    const vowelPattern = word.replace(/[bcdfghjklmnpqrstvwxyz]/gi, "C").replace(/[aeiou]/gi, "V")
    patterns.push(vowelPattern)

    if (word.length >= 2) {
      patterns.push(`start:${word.slice(0, 2)}`)
      patterns.push(`end:${word.slice(-2)}`)
    }

    return patterns
  }
}
