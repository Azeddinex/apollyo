// Session Manager - نظام إدارة الجلسة لمنع تكرار النتائج
export type SessionMemory = {
  sessionId: string
  startTime: number
  searches: SearchHistory[]
  returnedWords: Set<string>
  usedSources: Map<string, number>
  filterHistory: FilterUsage[]
  adaptiveStrategies: AdaptiveStrategy[]
}

export type SearchHistory = {
  timestamp: number
  mode: "speed" | "hyper"
  filters: any
  resultsCount: number
  sources: string[]
}

export type FilterUsage = {
  filters: any
  timestamp: number
  satisfaction: number // 0-1 based on user interaction
}

export type AdaptiveStrategy = {
  name: string
  description: string
  priority: number
  lastUsed: number
  successRate: number
}

export class SessionManager {
  private memory: SessionMemory
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  constructor() {
    this.memory = this.initializeSession()
  }

  private initializeSession(): SessionMemory {
    // محاولة تحميل جلسة موجودة
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("apollyo_session")
      if (saved) {
        const parsed = JSON.parse(saved)
        // التحقق من صلاحية الجلسة
        if (Date.now() - parsed.startTime < this.SESSION_DURATION) {
          return {
            ...parsed,
            returnedWords: new Set(parsed.returnedWords),
            usedSources: new Map(Object.entries(parsed.usedSources)),
          }
        }
      }
    }

    // إنشاء جلسة جديدة
    return {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      searches: [],
      returnedWords: new Set(),
      usedSources: new Map(),
      filterHistory: [],
      adaptiveStrategies: this.initializeStrategies(),
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeStrategies(): AdaptiveStrategy[] {
    return [
      {
        name: "source_rotation",
        description: "Rotate between different web sources",
        priority: 1,
        lastUsed: 0,
        successRate: 0.8,
      },
      {
        name: "pattern_variation",
        description: "Vary generation patterns",
        priority: 2,
        lastUsed: 0,
        successRate: 0.75,
      },
      {
        name: "depth_adjustment",
        description: "Adjust crawl depth dynamically",
        priority: 3,
        lastUsed: 0,
        successRate: 0.7,
      },
      {
        name: "filter_relaxation",
        description: "Slightly relax filters for diversity",
        priority: 4,
        lastUsed: 0,
        successRate: 0.65,
      },
      {
        name: "time_based_variation",
        description: "Use time-based seed for randomization",
        priority: 5,
        lastUsed: 0,
        successRate: 0.6,
      },
    ]
  }

  /**
   * تسجيل بحث جديد
   */
  public recordSearch(mode: "speed" | "hyper", filters: any, results: string[], sources: string[]) {
    this.memory.searches.push({
      timestamp: Date.now(),
      mode,
      filters,
      resultsCount: results.length,
      sources,
    })

    // إضافة النتائج إلى الذاكرة
    results.forEach((word) => this.memory.returnedWords.add(word))

    // تحديث استخدام المصادر
    sources.forEach((source) => {
      const count = this.memory.usedSources.get(source) || 0
      this.memory.usedSources.set(source, count + 1)
    })

    this.saveSession()
  }

  /**
   * التحقق من تكرار الكلمة
   */
  public isWordReturned(word: string): boolean {
    return this.memory.returnedWords.has(word)
  }

  /**
   * فلترة الكلمات المكررة
   */
  public filterDuplicates(words: string[]): string[] {
    return words.filter((word) => !this.isWordReturned(word))
  }

  /**
   * الحصول على استراتيجية تكيفية
   */
  public getAdaptiveStrategy(): AdaptiveStrategy {
    // ترتيب الاستراتيجيات حسب الأولوية ومعدل النجاح
    const sorted = [...this.memory.adaptiveStrategies].sort((a, b) => {
      // تفضيل الاستراتيجيات التي لم تستخدم مؤخراً
      const timeDiff = a.lastUsed - b.lastUsed
      if (Math.abs(timeDiff) > 60000) {
        // فرق أكثر من دقيقة
        return timeDiff
      }
      // ثم حسب معدل النجاح
      return b.successRate - a.successRate
    })

    const strategy = sorted[0]
    strategy.lastUsed = Date.now()

    this.saveSession()
    return strategy
  }

  /**
   * تحديث معدل نجاح الاستراتيجية
   */
  public updateStrategySuccess(strategyName: string, success: boolean) {
    const strategy = this.memory.adaptiveStrategies.find((s) => s.name === strategyName)
    if (strategy) {
      // تحديث معدل النجاح بشكل تدريجي
      const weight = 0.2 // وزن التحديث الجديد
      strategy.successRate = strategy.successRate * (1 - weight) + (success ? 1 : 0) * weight
      this.saveSession()
    }
  }

  /**
   * الحصول على المصادر الأقل استخداماً
   */
  public getLeastUsedSources(allSources: string[], count: number): string[] {
    const sorted = allSources.sort((a, b) => {
      const usageA = this.memory.usedSources.get(a) || 0
      const usageB = this.memory.usedSources.get(b) || 0
      return usageA - usageB
    })

    return sorted.slice(0, count)
  }

  /**
   * الحصول على إحصائيات الجلسة
   */
  public getSessionStats() {
    return {
      sessionId: this.memory.sessionId,
      duration: Date.now() - this.memory.startTime,
      totalSearches: this.memory.searches.length,
      uniqueWords: this.memory.returnedWords.size,
      sourcesUsed: this.memory.usedSources.size,
      strategies: this.memory.adaptiveStrategies,
    }
  }

  /**
   * حفظ الجلسة
   */
  private saveSession() {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "apollyo_session",
        JSON.stringify({
          ...this.memory,
          returnedWords: Array.from(this.memory.returnedWords),
          usedSources: Object.fromEntries(this.memory.usedSources),
        }),
      )
    }
  }

  /**
   * إعادة تعيين الجلسة
   */
  public resetSession() {
    this.memory = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      searches: [],
      returnedWords: new Set(),
      usedSources: new Map(),
      filterHistory: [],
      adaptiveStrategies: this.initializeStrategies(),
    }
    this.saveSession()
  }
}
