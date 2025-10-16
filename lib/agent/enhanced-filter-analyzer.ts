import type { FlexibleFilters, AdvancedFilters, OperationMode, SearchConfig } from "@/lib/types"
import { FilterManager } from "@/lib/filters/filter-manager"

export type FilterAnalysis = {
  complexity: "simple" | "moderate" | "complex"
  estimatedResults: number
  processingTime: "fast" | "medium" | "slow"
  recommendations: string[]
  optimizations: string[]
  crawlStrategy?: {
    depth: number
    sources: string[]
    priority: "speed" | "quality" | "balanced"
  }
  generationStrategy?: {
    patterns: string[]
    count: number
    quality: "standard" | "high" | "premium"
  }
}

export type ProcessingPlan = {
  mode: OperationMode
  filters: FlexibleFilters | AdvancedFilters
  analysis: FilterAnalysis
  steps: ProcessingStep[]
  estimatedDuration: number
}

export type ProcessingStep = {
  id: string
  name: string
  description: string
  type: "validation" | "generation" | "crawling" | "filtering" | "scoring"
  priority: number
  dependencies: string[]
}

export class EnhancedFilterAnalyzer {
  /**
   * تحليل الفلاتر وإنشاء خطة معالجة محسنة
   */
  public static async analyzeAndPrepare(config: SearchConfig, openaiKey?: string): Promise<ProcessingPlan> {
    console.log("[v0] Enhanced Filter Analyzer: Starting analysis...")

    if (openaiKey) {
      console.log("[v0] Enhanced Filter Analyzer: Using OpenAI for advanced analysis")
      try {
        const aiEnhancedAnalysis = await this.analyzeWithAI(config, openaiKey)
        if (aiEnhancedAnalysis) {
          return aiEnhancedAnalysis
        }
      } catch (error) {
        console.warn("[v0] Enhanced Filter Analyzer: OpenAI analysis failed, falling back to standard analysis", error)
      }
    }

    // المرحلة 1: التحقق من صحة الفلاتر
    const validation = FilterManager.validateFilters(config.filters, config.mode)
    if (!validation.valid) {
      throw new Error(`Invalid filters: ${validation.errors.join(", ")}`)
    }

    // المرحلة 2: تحليل تعقيد الفلاتر
    const analysis = this.analyzeFilterComplexity(config.filters, config.mode)

    // المرحلة 3: إنشاء خطة المعالجة
    const steps = this.createProcessingSteps(config.mode, config.filters, analysis)

    // المرحلة 4: تقدير الوقت
    const estimatedDuration = this.estimateProcessingTime(analysis, config.mode, config.maxResults)

    console.log("[v0] Enhanced Filter Analyzer: Analysis complete", {
      complexity: analysis.complexity,
      estimatedResults: analysis.estimatedResults,
      processingTime: analysis.processingTime,
      steps: steps.length,
    })

    return {
      mode: config.mode,
      filters: config.filters,
      analysis,
      steps,
      estimatedDuration,
    }
  }

  /**
   * تحليل تعقيد الفلاتر
   */
  private static analyzeFilterComplexity(
    filters: FlexibleFilters | AdvancedFilters,
    mode: OperationMode,
  ): FilterAnalysis {
    let complexityScore = 0
    const recommendations: string[] = []
    const optimizations: string[] = []

    // تحليل الفلاتر الأساسية
    if (filters.length) {
      const range = filters.length.max - filters.length.min
      if (range > 10) {
        complexityScore += 2
        recommendations.push("Consider narrowing the length range for better results")
      } else if (range > 5) {
        complexityScore += 1
      }
    }

    if (filters.pattern) {
      if (filters.pattern.startsWith) complexityScore += 1
      if (filters.pattern.endsWith) complexityScore += 1
      if (filters.pattern.contains) complexityScore += 2
    }

    // تحليل الفلاتر المتقدمة (Hyper Mode فقط)
    let crawlStrategy: FilterAnalysis["crawlStrategy"] | undefined
    let generationStrategy: FilterAnalysis["generationStrategy"] | undefined

    if (mode === "hyper") {
      const advFilters = filters as AdvancedFilters

      if (advFilters.rarity) {
        complexityScore += 2
        if (advFilters.rarity.min > 0.7) {
          recommendations.push("High rarity threshold may limit results significantly")
        }
      }

      if (advFilters.marketPotential) {
        complexityScore += 2
        if (advFilters.marketPotential.min > 0.7) {
          recommendations.push("High market potential threshold requires deep analysis")
        }
      }

      if (advFilters.pronunciation) {
        complexityScore += 1
      }

      if (advFilters.memorability) {
        complexityScore += 1
      }

      if (advFilters.linguistic) {
        complexityScore += 2
        if (!advFilters.linguistic.requireVowels) {
          optimizations.push("Allowing consonant-only words may produce unusual results")
        }
      }

      // استراتيجية الكشط للـ Hyper Mode
      crawlStrategy = {
        depth: this.calculateCrawlDepth(complexityScore),
        sources: this.selectCrawlSources(advFilters),
        priority: this.determinePriority(advFilters),
      }
    } else {
      // استراتيجية التوليد للـ Speed Mode
      generationStrategy = {
        patterns: this.selectGenerationPatterns(filters),
        count: this.calculateGenerationCount(filters),
        quality: "standard",
      }
    }

    // تحديد التعقيد الإجمالي
    const complexity: FilterAnalysis["complexity"] =
      complexityScore <= 3 ? "simple" : complexityScore <= 7 ? "moderate" : "complex"

    // تقدير عدد النتائج
    const estimatedResults = this.estimateResultCount(filters, mode, complexity)

    // تقدير وقت المعالجة
    const processingTime: FilterAnalysis["processingTime"] =
      complexity === "simple" ? "fast" : complexity === "moderate" ? "medium" : "slow"

    return {
      complexity,
      estimatedResults,
      processingTime,
      recommendations,
      optimizations,
      crawlStrategy,
      generationStrategy,
    }
  }

  /**
   * إنشاء خطوات المعالجة
   */
  private static createProcessingSteps(
    mode: OperationMode,
    _filters: FlexibleFilters | AdvancedFilters,
    analysis: FilterAnalysis,
  ): ProcessingStep[] {
    const steps: ProcessingStep[] = []

    // خطوة 1: التحقق من الفلاتر
    steps.push({
      id: "validate-filters",
      name: "Validate Filters",
      description: "Verify all filter parameters are valid",
      type: "validation",
      priority: 1,
      dependencies: [],
    })

    if (mode === "speed") {
      // خطوات Speed Mode
      steps.push({
        id: "initialize-generator",
        name: "Initialize Word Generator",
        description: "Prepare internal word generation engine",
        type: "generation",
        priority: 2,
        dependencies: ["validate-filters"],
      })

      steps.push({
        id: "generate-words",
        name: "Generate Words",
        description: `Generate words using ${analysis.generationStrategy?.patterns.length || 0} patterns`,
        type: "generation",
        priority: 3,
        dependencies: ["initialize-generator"],
      })

      steps.push({
        id: "apply-flexible-filters",
        name: "Apply Flexible Filters",
        description: "Filter generated words by length and pattern",
        type: "filtering",
        priority: 4,
        dependencies: ["generate-words"],
      })
    } else {
      // خطوات Hyper Mode
      steps.push({
        id: "prepare-crawler",
        name: "Prepare Web Crawler",
        description: `Initialize crawler with depth ${analysis.crawlStrategy?.depth || 1}`,
        type: "crawling",
        priority: 2,
        dependencies: ["validate-filters"],
      })

      steps.push({
        id: "crawl-sources",
        name: "Crawl Web Sources",
        description: `Scrape ${analysis.crawlStrategy?.sources.length || 0} sources`,
        type: "crawling",
        priority: 3,
        dependencies: ["prepare-crawler"],
      })

      steps.push({
        id: "apply-advanced-filters",
        name: "Apply Advanced Filters",
        description: "Filter results by rarity, market potential, and linguistic rules",
        type: "filtering",
        priority: 4,
        dependencies: ["crawl-sources"],
      })

      steps.push({
        id: "deep-analysis",
        name: "Deep Analysis",
        description: "Analyze pronunciation, memorability, and market potential",
        type: "scoring",
        priority: 5,
        dependencies: ["apply-advanced-filters"],
      })
    }

    // خطوات مشتركة
    steps.push({
      id: "validate-words",
      name: "Validate Words",
      description: "Verify English validity using Internal Intelligence Agent",
      type: "validation",
      priority: mode === "speed" ? 5 : 6,
      dependencies: [mode === "speed" ? "apply-flexible-filters" : "deep-analysis"],
    })

    steps.push({
      id: "score-and-rank",
      name: "Score and Rank",
      description: "Calculate final scores and rank results",
      type: "scoring",
      priority: mode === "speed" ? 6 : 7,
      dependencies: ["validate-words"],
    })

    return steps
  }

  /**
   * حساب عمق الكشط
   */
  private static calculateCrawlDepth(complexityScore: number): number {
    if (complexityScore <= 3) return 1
    if (complexityScore <= 7) return 2
    return 3
  }

  /**
   * اختيار مصادر الكشط
   */
  private static selectCrawlSources(filters: AdvancedFilters): string[] {
    const sources: string[] = ["dictionary", "thesaurus", "word-lists"]

    if (filters.rarity && filters.rarity.min > 0.5) {
      sources.push("rare-words", "technical-terms")
    }

    if (filters.marketPotential && filters.marketPotential.min > 0.6) {
      sources.push("brand-names", "domain-names")
    }

    return sources
  }

  /**
   * تحديد الأولوية
   */
  private static determinePriority(filters: AdvancedFilters): "speed" | "quality" | "balanced" {
    const hasStrictFilters =
      (filters.rarity && filters.rarity.min > 0.7) || (filters.marketPotential && filters.marketPotential.min > 0.7)

    if (hasStrictFilters) return "quality"

    const hasModerateFilters =
      (filters.rarity && filters.rarity.min > 0.4) || (filters.marketPotential && filters.marketPotential.min > 0.4)

    if (hasModerateFilters) return "balanced"

    return "speed"
  }

  /**
   * اختيار أنماط التوليد
   */
  private static selectGenerationPatterns(filters: FlexibleFilters): string[] {
    const patterns: string[] = ["CVC", "CVCV", "CVCC", "CCVC"]

    if (filters.length) {
      if (filters.length.max >= 8) {
        patterns.push("CVCVCV", "CVCCVC")
      }
      if (filters.length.min <= 4) {
        patterns.push("CV", "VC")
      }
    }

    return patterns
  }

  /**
   * حساب عدد التوليد
   */
  private static calculateGenerationCount(filters: FlexibleFilters): number {
    let baseCount = 1000

    if (filters.pattern) {
      if (filters.pattern.startsWith) baseCount *= 0.5
      if (filters.pattern.endsWith) baseCount *= 0.5
      if (filters.pattern.contains) baseCount *= 0.3
    }

    return Math.max(500, Math.floor(baseCount))
  }

  /**
   * تقدير عدد النتائج
   */
  private static estimateResultCount(
    filters: FlexibleFilters | AdvancedFilters,
    mode: OperationMode,
    complexity: FilterAnalysis["complexity"],
  ): number {
    let estimate = mode === "speed" ? 1000 : 3000

    if (complexity === "moderate") estimate *= 0.6
    if (complexity === "complex") estimate *= 0.3

    if (filters.pattern) {
      if (filters.pattern.startsWith) estimate *= 0.4
      if (filters.pattern.endsWith) estimate *= 0.4
      if (filters.pattern.contains) estimate *= 0.2
    }

    return Math.max(50, Math.floor(estimate))
  }

  /**
   * تقدير وقت المعالجة
   */
  private static estimateProcessingTime(analysis: FilterAnalysis, mode: OperationMode, maxResults: number): number {
    let baseTime = mode === "speed" ? 2000 : 5000 // milliseconds

    if (analysis.complexity === "moderate") baseTime *= 1.5
    if (analysis.complexity === "complex") baseTime *= 2.5

    if (maxResults > 1000) baseTime *= 1.3
    if (maxResults > 3000) baseTime *= 1.6

    return Math.floor(baseTime)
  }

  /**
   * تحسين الفلاتر تلقائياً
   */
  public static optimizeFilters(
    filters: FlexibleFilters | AdvancedFilters,
    mode: OperationMode,
  ): FlexibleFilters | AdvancedFilters {
    const optimized = { ...filters }

    // تحسين نطاق الطول
    if (optimized.length) {
      if (optimized.length.max - optimized.length.min > 12) {
        optimized.length.max = optimized.length.min + 10
      }
    }

    // تحسينات خاصة بـ Hyper Mode
    if (mode === "hyper") {
      const advOptimized = optimized as AdvancedFilters

      // ضبط الندرة
      if (advOptimized.rarity && advOptimized.rarity.min > 0.9) {
        advOptimized.rarity.min = 0.8 // تخفيف القيود الصارمة جداً
      }

      // ضبط إمكانية السوق
      if (advOptimized.marketPotential && advOptimized.marketPotential.min > 0.9) {
        advOptimized.marketPotential.min = 0.7
      }
    }

    return optimized
  }

  private static async analyzeWithAI(config: SearchConfig, openaiKey: string): Promise<ProcessingPlan | null> {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an expert in English word analysis and discovery. Analyze the given filters and provide strategic recommendations for word discovery.",
            },
            {
              role: "user",
              content: `Analyze these word discovery filters and provide recommendations:
Mode: ${config.mode}
Filters: ${JSON.stringify(config.filters, null, 2)}
Max Results: ${config.maxResults}

Provide:
1. Complexity assessment (simple/moderate/complex)
2. Estimated result count
3. Processing time estimate (fast/medium/slow)
4. Strategic recommendations
5. Optimization suggestions`,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content

      if (!aiResponse) {
        return null
      }

      console.log("[v0] Enhanced Filter Analyzer: AI analysis completed")

      const standardAnalysis = this.analyzeFilterComplexity(config.filters, config.mode)
      const steps = this.createProcessingSteps(config.mode, config.filters, standardAnalysis)
      const estimatedDuration = this.estimateProcessingTime(standardAnalysis, config.mode, config.maxResults)

      standardAnalysis.recommendations.unshift(`AI Insight: ${aiResponse.substring(0, 200)}...`)

      return {
        mode: config.mode,
        filters: config.filters,
        analysis: standardAnalysis,
        steps,
        estimatedDuration,
      }
    } catch (error) {
      console.error("[v0] Enhanced Filter Analyzer: AI analysis error:", error)
      return null
    }
  }
}
