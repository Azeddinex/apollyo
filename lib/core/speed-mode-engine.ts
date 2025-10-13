import { InternalIntelligenceAgent } from "@/lib/agent/internal-intelligence"
import { SessionManager } from "@/lib/core/session-manager"
import type { EnhancedFilters } from "@/lib/types/filters"
import { isLikelyEnglishWord, getRandomEnglishWords, generateWordVariations } from "@/lib/data/english-dictionary"

export type SpeedModeResult = {
  word: string
  score: number
  rarity: number
  marketPotential: number
  validation: any
  patterns: string[]
}

export class SpeedModeEngine {
  private agent: InternalIntelligenceAgent
  private sessionManager: SessionManager
  private basePatterns: Map<string, number>
  private wordCache: Map<string, SpeedModeResult>

  constructor() {
    this.agent = new InternalIntelligenceAgent()
    this.sessionManager = new SessionManager()
    this.basePatterns = this.initializeBasePatterns()
    this.wordCache = new Map()
    this.agent.loadMemory()
  }

  private initializeBasePatterns(): Map<string, number> {
    return new Map([
      ["CV", 0.8],
      ["CVC", 0.9],
      ["VC", 0.7],
      ["CVCV", 0.85],
      ["VCVC", 0.75],
      ["CVCC", 0.8],
      ["CCVC", 0.7],
      ["CVVC", 0.6],
      ["CCVCC", 0.75],
      ["CVCVC", 0.8],
    ])
  }

  public generateWords(filters: EnhancedFilters, count = 1000): SpeedModeResult[] {
    const strategy = this.sessionManager.getAdaptiveStrategy()
    console.log("[v0] Speed Mode using adaptive strategy:", strategy.name)

    const results: SpeedModeResult[] = []
    const generated = new Set<string>()
    const { min = 3, max = 12 } = filters.length || {}

    const dictionaryWords = getRandomEnglishWords(Math.floor(count * 0.6), min, max)
    dictionaryWords.forEach((word) => {
      if (!generated.has(word) && !this.sessionManager.isWordReturned(word)) {
        generated.add(word)
        const result = this.analyzeWord(word, filters)
        if (result.score >= 0.7) {
          results.push(result)
        }
      }
    })

    const baseWords = getRandomEnglishWords(50, 3, 8)
    baseWords.forEach((baseWord) => {
      const variations = generateWordVariations(baseWord)
      variations.forEach((word) => {
        if (
          word.length >= min &&
          word.length <= max &&
          !generated.has(word) &&
          !this.sessionManager.isWordReturned(word) &&
          isLikelyEnglishWord(word)
        ) {
          generated.add(word)
          const result = this.analyzeWord(word, filters)
          if (result.score >= 0.7) {
            results.push(result)
          }
        }
      })
    })

    const patternBased = this.generateFromPatterns(filters, Math.floor(count * 0.1), strategy)
    patternBased.forEach((word) => {
      if (!generated.has(word) && !this.sessionManager.isWordReturned(word)) {
        generated.add(word)
        const result = this.analyzeWord(word, filters)
        if (result.score >= 0.8) {
          results.push(result)
        }
      }
    })

    const sortedResults = this.sortWithDiversity(results, strategy).slice(0, count)

    this.sessionManager.recordSearch(
      "speed",
      filters,
      sortedResults.map((r) => r.word),
      ["internal-generation"],
    )

    const success = sortedResults.length >= count * 0.5
    this.sessionManager.updateStrategySuccess(strategy.name, success)

    console.log("[v0] Speed Mode generated", sortedResults.length, "valid English words")
    return sortedResults
  }

  private getGenerationRatios(strategy: any): { pattern: number; preference: number; random: number } {
    if (strategy.name === "pattern_variation") {
      return { pattern: 0.4, preference: 0.3, random: 0.3 }
    }
    if (strategy.name === "time_based_variation") {
      const hour = new Date().getHours()
      const isDay = hour >= 6 && hour < 18
      return isDay ? { pattern: 0.6, preference: 0.3, random: 0.1 } : { pattern: 0.5, preference: 0.2, random: 0.3 }
    }
    return { pattern: 0.6, preference: 0.3, random: 0.1 }
  }

  private sortWithDiversity(results: SpeedModeResult[], strategy: any): SpeedModeResult[] {
    if (strategy.name === "pattern_variation") {
      const patternGroups = new Map<string, SpeedModeResult[]>()

      results.forEach((result) => {
        const pattern = result.patterns[0] || "unknown"
        if (!patternGroups.has(pattern)) {
          patternGroups.set(pattern, [])
        }
        patternGroups.get(pattern)!.push(result)
      })

      const diverseResults: SpeedModeResult[] = []
      const maxPerPattern = Math.ceil(results.length / patternGroups.size)

      patternGroups.forEach((group) => {
        const sorted = group.sort((a, b) => b.score - a.score)
        diverseResults.push(...sorted.slice(0, maxPerPattern))
      })

      return diverseResults.sort((a, b) => b.score - a.score)
    }

    return results.sort((a, b) => b.score - a.score)
  }

  private generateFromPatterns(filters: EnhancedFilters, count: number, strategy?: any): string[] {
    const words: string[] = []
    const { min = 3, max = 12 } = filters.length || {}

    const patternVariation = strategy?.name === "pattern_variation" ? Math.random() : 0

    const targetCount = count * 3

    for (let i = 0; i < targetCount && words.length < count; i++) {
      const pattern = this.selectWeightedPattern(patternVariation)
      const word = this.buildWordFromPattern(pattern, min, max)

      if (word && this.isValidLength(word, min, max) && isLikelyEnglishWord(word)) {
        words.push(word)
      }
    }

    return words
  }

  private selectWeightedPattern(variation = 0): string {
    let totalWeight = 0
    this.basePatterns.forEach((weight) => (totalWeight += weight))

    let random = (Math.random() + variation * 0.3) * totalWeight
    for (const [pattern, weight] of this.basePatterns) {
      random -= weight
      if (random <= 0) return pattern
    }

    return "CVC"
  }

  private buildWordFromPattern(pattern: string, min: number, max: number): string {
    const commonConsonants = "tnrsldcmpbfghvwykjxqz" // Ordered by frequency in English
    const commonVowels = "eaiouy" // Ordered by frequency in English

    let word = ""

    for (const char of pattern) {
      if (char === "C") {
        const index = Math.floor(Math.pow(Math.random(), 1.5) * commonConsonants.length)
        word += commonConsonants[index]
      } else if (char === "V") {
        const index = Math.floor(Math.pow(Math.random(), 1.5) * commonVowels.length)
        word += commonVowels[index]
      }
    }

    while (word.length < min) {
      const shouldAddConsonant = Math.random() > 0.5
      word += shouldAddConsonant
        ? commonConsonants[Math.floor(Math.pow(Math.random(), 1.5) * commonConsonants.length)]
        : commonVowels[Math.floor(Math.pow(Math.random(), 1.5) * commonVowels.length)]
    }

    if (word.length > max) {
      word = word.substring(0, max)
    }

    return word
  }

  private generateFromPreferences(filters: EnhancedFilters, count: number): string[] {
    const words: string[] = []
    return words
  }

  private generateRandomSmart(filters: EnhancedFilters, count: number, strategy?: any): string[] {
    const words: string[] = []
    const { min = 3, max = 12 } = filters.length || {}

    const timeSeed = strategy?.name === "time_based_variation" ? Date.now() % 1000 : 0

    for (let i = 0; i < count; i++) {
      const length = Math.floor((Math.random() + timeSeed / 10000) * (max - min + 1)) + min
      let word = ""

      for (let j = 0; j < length; j++) {
        const isVowel = j === 0 ? Math.random() > 0.3 : this.shouldBeVowel(word)
        word += isVowel ? this.getRandomVowel() : this.getRandomConsonant(word)
      }

      words.push(word)
    }

    return words
  }

  private shouldBeVowel(currentWord: string): boolean {
    if (currentWord.length === 0) return Math.random() > 0.7

    const lastChar = currentWord[currentWord.length - 1]
    const vowels = "aeiou"

    if (!vowels.includes(lastChar)) {
      return Math.random() > 0.4
    }

    return Math.random() > 0.7
  }

  private getRandomVowel(): string {
    const vowels = "aeiou"
    return vowels[Math.floor(Math.random() * vowels.length)]
  }

  private getRandomConsonant(currentWord: string): string {
    const consonants = "bcdfghjklmnpqrstvwxyz"
    let availableConsonants = consonants

    if (currentWord.length > 0) {
      const lastChar = currentWord[currentWord.length - 1]
      if ("sxz".includes(lastChar)) {
        availableConsonants = availableConsonants.replace(/[hszx]/g, "")
      }
    }

    return availableConsonants[Math.floor(Math.random() * availableConsonants.length)]
  }

  private analyzeWord(word: string, filters: EnhancedFilters): SpeedModeResult {
    if (this.wordCache.has(word)) {
      return this.wordCache.get(word)!
    }

    const validation = this.agent.validateEnglishWord(word)

    if (!validation.isValid || validation.confidence < 0.75) {
      return {
        word,
        score: 0,
        rarity: 0,
        marketPotential: 0,
        validation,
        patterns: [],
      }
    }

    const patterns = this.extractWordPatterns(word)

    const result: SpeedModeResult = {
      word,
      score: validation.confidence * 0.6 + validation.rarityScore * 0.4,
      rarity: validation.rarityScore,
      marketPotential: validation.marketPotential,
      validation,
      patterns,
    }

    this.wordCache.set(word, result)

    return result
  }

  private extractWordPatterns(word: string): string[] {
    const patterns: string[] = []

    const vowelPattern = word.replace(/[bcdfghjklmnpqrstvwxyz]/gi, "C").replace(/[aeiou]/gi, "V")
    patterns.push(vowelPattern)

    if (word.length >= 2) {
      patterns.push(`start:${word.slice(0, 2)}`)
      patterns.push(`end:${word.slice(-2)}`)
    }

    const syllables = this.countSyllables(word)
    patterns.push(`syllables:${syllables}`)

    return patterns
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase()
    if (word.length <= 3) return 1

    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    word = word.replace(/^y/, "")

    const matches = word.match(/[aeiouy]{1,2}/g)
    return matches ? Math.max(1, matches.length) : 1
  }

  private isValidLength(word: string, min: number, max: number): boolean {
    return word.length >= min && word.length <= max
  }
}
