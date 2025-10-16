import { SpeedModeEngine } from "./speed-mode-engine"
import { InternalIntelligenceAgent } from "@/lib/agent/internal-intelligence"
import type { EnhancedFilters } from "@/lib/types/filters"

export type OperationMode = "speed" | "balanced" | "precision"

export type ModeConfig = {
  maxResults: number
  qualityThreshold: number
  validationStrictness: number
  intelligenceDepth: number
  useLearning: boolean
}

export type WordResult = {
  word: string
  count: number
  sources: string[]
  scores: {
    speedScore?: number
    rarity: number
    marketPotential: number
    validation: any
  }
  metadata: {
    generated?: boolean
    patterns?: string[]
    mode: string
    intelligenceValidated?: boolean
  }
}

export class AdvancedModeManager {
  private speedEngine: SpeedModeEngine
  private intelligenceAgent: InternalIntelligenceAgent
  constructor() {
    this.speedEngine = new SpeedModeEngine()
    this.intelligenceAgent = new InternalIntelligenceAgent()
  }

  public async executeSearch(
    query: string,
    filters: EnhancedFilters,
    mode: OperationMode = "balanced",
  ): Promise<WordResult[]> {
    const config = this.getModeConfig(mode)

    let results: WordResult[] = []

    switch (mode) {
      case "speed":
        results = await this.executeSpeedMode(filters, config)
        break

      case "balanced":
        results = await this.executeBalancedMode(query, filters, config)
        break

      case "precision":
        results = await this.executePrecisionMode(query, filters, config)
        break
    }

    // تطبيق التحقق النهائي والترتيب
    return this.applyFinalValidationAndRanking(results, config)
  }

  private async executeSpeedMode(filters: EnhancedFilters, config: ModeConfig): Promise<WordResult[]> {
    const generatedWords = this.speedEngine.generateWords(filters, config.maxResults)

    return generatedWords.map((result) => ({
      word: result.word,
      count: 1,
      sources: ["speed_engine"],
      scores: {
        speedScore: result.score,
        rarity: result.rarity,
        marketPotential: result.marketPotential,
        validation: result.validation,
      },
      metadata: {
        generated: true,
        patterns: result.patterns,
        mode: "speed",
      },
    }))
  }

  private async executeBalancedMode(
    _query: string,
    filters: EnhancedFilters,
    config: ModeConfig,
  ): Promise<WordResult[]> {
    // في الوضع المتوازن، نستخدم Speed Mode فقط
    // يمكن إضافة Hyper Mode لاحقاً عند الحاجة
    const speedResults = await this.executeSpeedMode(filters, {
      ...config,
      maxResults: config.maxResults,
    })

    return speedResults
  }

  private async executePrecisionMode(
    _query: string,
    filters: EnhancedFilters,
    config: ModeConfig,
  ): Promise<WordResult[]> {
    // وضع الدقة: تنفيذ مكثف مع تحقق متعدد المراحل
    const initialResults = await this.executeSpeedMode(filters, config)

    // تطبيق تحقق إضافي باستخدام العامل الذكي
    const validatedResults = initialResults.filter((result) => {
      const validation = this.intelligenceAgent.validateEnglishWord(result.word)
      return validation.isValid && validation.confidence >= config.validationStrictness
    })

    // ترتيب إضافي بناءً على إمكانية السوق
    return validatedResults.sort((a, b) => {
      const scoreA = (a.scores.rarity || 0) * 0.6 + (a.scores.marketPotential || 0) * 0.4
      const scoreB = (b.scores.rarity || 0) * 0.6 + (b.scores.marketPotential || 0) * 0.4
      return scoreB - scoreA
    })
  }

  private applyFinalValidationAndRanking(results: WordResult[], config: ModeConfig): WordResult[] {
    return results
      .filter((result) => {
        // تطبيق عتبة الجودة
        const overallScore = this.calculateOverallScore(result)
        return overallScore >= config.qualityThreshold
      })
      .sort((a, b) => {
        // ترتيب حسب النقاط الإجمالية
        const scoreA = this.calculateOverallScore(a)
        const scoreB = this.calculateOverallScore(b)
        return scoreB - scoreA
      })
      .slice(0, config.maxResults)
  }

  private calculateOverallScore(result: WordResult): number {
    const scores = result.scores || {}

    return (
      (scores.speedScore || 0) * 0.3 +
      (scores.rarity || 0) * 0.4 +
      (scores.marketPotential || 0) * 0.2 +
      (scores.validation?.confidence || 0) * 0.1
    )
  }

  private getModeConfig(mode: OperationMode): ModeConfig {
    const configs: Record<OperationMode, ModeConfig> = {
      speed: {
        maxResults: 2000,
        qualityThreshold: 0.6,
        validationStrictness: 0.7,
        intelligenceDepth: 2,
        useLearning: true,
      },
      balanced: {
        maxResults: 3000,
        qualityThreshold: 0.65,
        validationStrictness: 0.75,
        intelligenceDepth: 2,
        useLearning: true,
      },
      precision: {
        maxResults: 1000,
        qualityThreshold: 0.8,
        validationStrictness: 0.9,
        intelligenceDepth: 4,
        useLearning: true,
      },
    }

    return configs[mode]
  }
}
