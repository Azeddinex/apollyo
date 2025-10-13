import { SpeedModeEngine } from "./speed-mode-engine"
import { HyperCrawler } from "./hyper-crawler"
import { SessionManager } from "./session-manager"
import { EnhancedFilterAnalyzer } from "@/lib/agent/enhanced-filter-analyzer"
import type { SearchConfig, WordResult } from "@/lib/types"
import type { ProcessingPlan } from "@/lib/agent/enhanced-filter-analyzer"

export class SearchEngine {
  private speedEngine: SpeedModeEngine
  private hyperCrawler: HyperCrawler
  private sessionManager: SessionManager

  constructor() {
    this.speedEngine = new SpeedModeEngine()
    this.hyperCrawler = new HyperCrawler()
    this.sessionManager = new SessionManager()
  }

  public async search(config: SearchConfig, openaiKey?: string): Promise<WordResult[]> {
    console.log("[v0] Starting search with config:", config)
    console.log("[v0] Session stats:", this.sessionManager.getSessionStats())

    console.log("[v0] Step 1: Analyzing filters with Enhanced Filter Analyzer Agent...")
    const processingPlan = await EnhancedFilterAnalyzer.analyzeAndPrepare(config, openaiKey)

    console.log("[v0] Processing plan created:", {
      complexity: processingPlan.analysis.complexity,
      estimatedResults: processingPlan.analysis.estimatedResults,
      processingTime: processingPlan.analysis.processingTime,
      steps: processingPlan.steps.length,
      estimatedDuration: `${processingPlan.estimatedDuration}ms`,
      aiEnhanced: !!openaiKey,
    })

    if (processingPlan.analysis.recommendations.length > 0) {
      console.log("[v0] Recommendations:", processingPlan.analysis.recommendations)
    }

    console.log("[v0] Step 2: Executing processing plan...")
    const results = await this.executeProcessingPlan(processingPlan, config)

    const uniqueResults = results.filter((result) => !this.sessionManager.isWordReturned(result.word))
    console.log("[v0] Filtered", results.length - uniqueResults.length, "duplicate words from session")

    console.log("[v0] Search completed with", uniqueResults.length, "unique results")
    return uniqueResults
  }

  private async executeProcessingPlan(plan: ProcessingPlan, config: SearchConfig): Promise<WordResult[]> {
    let results: WordResult[] = []

    // تنفيذ الخطوات بالترتيب
    for (const step of plan.steps) {
      console.log(`[v0] Executing step: ${step.name} (${step.type})`)

      // يمكن إضافة معالجة خاصة لكل نوع من الخطوات هنا
      // لكن الآن سنقوم بالتنفيذ الأساسي
    }

    if (config.mode === "speed") {
      // Speed Mode: توليد داخلي مع فلاتر مرنة
      console.log("[v0] Using Speed Mode with flexible filters")
      console.log("[v0] Generation strategy:", plan.analysis.generationStrategy)

      const speedResults = this.speedEngine.generateWords(plan.filters as any, config.maxResults)

      results = speedResults.map((result) => ({
        word: result.word,
        source: "generated" as const,
        scores: {
          rarity: result.rarity,
          marketPotential: result.marketPotential,
          confidence: result.validation.confidence,
          overall: result.score,
        },
        metadata: {
          length: result.word.length,
          patterns: result.patterns,
          validation: result.validation,
        },
      }))
    } else {
      // Hyper Mode: كشط ويب مع كل الفلاتر المتقدمة
      console.log("[v0] Using Hyper Mode with advanced filters")
      console.log("[v0] Crawl strategy:", plan.analysis.crawlStrategy)

      const crawlResult = await this.hyperCrawler.crawl(
        plan.filters as any,
        config.maxResults,
        plan.analysis.crawlStrategy?.depth || config.depth || 3,
      )

      results = crawlResult.words
      console.log("[v0] Hyper Mode stats:", crawlResult.stats)
    }

    return results
  }

  public async searchBoth(config: Omit<SearchConfig, "mode">): Promise<{
    speed: WordResult[]
    hyper: WordResult[]
    combined: WordResult[]
  }> {
    console.log("[v0] Running both modes in parallel")

    const [speedResults, hyperResults] = await Promise.all([
      this.search({ ...config, mode: "speed" }),
      this.search({ ...config, mode: "hyper" }),
    ])

    // دمج النتائج وإزالة التكرارات
    const combined = this.mergeResults(speedResults, hyperResults)

    return {
      speed: speedResults,
      hyper: hyperResults,
      combined,
    }
  }

  private mergeResults(speedResults: WordResult[], hyperResults: WordResult[]): WordResult[] {
    const mergedMap = new Map<string, WordResult>()

    speedResults.forEach((result) => {
      mergedMap.set(result.word, result)
    })

    hyperResults.forEach((result) => {
      if (mergedMap.has(result.word)) {
        const existing = mergedMap.get(result.word)!
        existing.scores.rarity = Math.max(existing.scores.rarity, result.scores.rarity)
        existing.scores.marketPotential = Math.max(existing.scores.marketPotential, result.scores.marketPotential)
        existing.scores.confidence = Math.max(existing.scores.confidence, result.scores.confidence)
        existing.scores.overall = Math.max(existing.scores.overall, result.scores.overall)

        existing.metadata.sources = [...(existing.metadata.sources || []), ...(result.metadata.sources || [])]
      } else {
        mergedMap.set(result.word, result)
      }
    })

    return Array.from(mergedMap.values()).sort((a, b) => b.scores.overall - a.scores.overall)
  }

  public resetSession() {
    this.sessionManager.resetSession()
    console.log("[v0] Session reset successfully")
  }

  public getSessionStats() {
    return this.sessionManager.getSessionStats()
  }
}
