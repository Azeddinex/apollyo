// Internal Intelligence Agent - النظام الذكي الداخلي
import { isLikelyEnglishWord, COMMON_ENGLISH_WORDS } from "@/lib/data/english-dictionary"

export type LearningMemory = {
  userPreferences: {
    selectedWords: Set<string>
    rejectedWords: Set<string>
    preferredPatterns: string[]
    avoidedPatterns: string[]
  }
  performanceMetrics: {
    successRates: Map<string, number>
    sourceReliability: Map<string, number>
    filterEffectiveness: Map<string, number>
  }
  trendAnalysis: {
    popularPatterns: string[]
    emergingTrends: string[]
    seasonalVariations: Map<string, number>
  }
}

export type ValidationResult = {
  isValid: boolean
  confidence: number
  issues: string[]
  suggestions: string[]
  rarityScore: number
  marketPotential: number
}

export class InternalIntelligenceAgent {
  private memory: LearningMemory
  private validationPatterns: Map<string, RegExp>
  private englishPatterns: Set<string>
  private rarityThreshold = 0.3

  constructor() {
    this.memory = this.initializeMemory()
    this.validationPatterns = this.initializeValidationPatterns()
    this.englishPatterns = this.initializeEnglishPatterns()
  }

  private initializeMemory(): LearningMemory {
    return {
      userPreferences: {
        selectedWords: new Set(),
        rejectedWords: new Set(),
        preferredPatterns: [],
        avoidedPatterns: [],
      },
      performanceMetrics: {
        successRates: new Map(),
        sourceReliability: new Map(),
        filterEffectiveness: new Map(),
      },
      trendAnalysis: {
        popularPatterns: [],
        emergingTrends: [],
        seasonalVariations: new Map(),
      },
    }
  }

  private initializeValidationPatterns(): Map<string, RegExp> {
    return new Map([
      // أنماط الإنجليزية الأساسية
      ["basic_english", /^[a-z]+$/i],
      ["proper_nouns", /^[A-Z][a-z]+$/],
      ["compound_words", /^[a-z]+[A-Z][a-z]+$/],

      // أنماط الصوتيات الإنجليزية
      ["english_phonetics", /^(?=.*[aeiou])(?=.*[bcdfghjklmnpqrstvwxyz])[a-z]+$/i],
      ["common_syllables", /^(?:[bcdfghjklmnpqrstvwxyz]*[aeiouy]+)+[bcdfghjklmnpqrstvwxyz]*$/i],

      // أنماط تجنب الكلمات المبتكرة غير الواقعية
      ["avoid_invented", /^(?!.*[zxq]{3,})(?!.*[jkvwxz]{4,})[a-z]+$/i],
      ["natural_flow", /^([bcdfghjklmnpqrstvwxyz]*[aeiou]){2,}[bcdfghjklmnpqrstvwxyz]*$/i],
    ])
  }

  private initializeEnglishPatterns(): Set<string> {
    // أنماط مقطعية شائعة في الإنجليزية
    return new Set([
      "ing",
      "tion",
      "ment",
      "ness",
      "able",
      "ible",
      "ful",
      "less",
      "ly",
      "ity",
      "ance",
      "ence",
      "dom",
      "ship",
      "hood",
      "ism",
      "er",
      "est",
      "ed",
      "s",
      "es",
      "'s",
      "s'",
    ])
  }

  public validateEnglishWord(word: string): ValidationResult {
    const issues: string[] = []
    const suggestions: string[] = []
    let confidence = 1.0
    let isValid = true

    // التحقق الأساسي من الإنجليزية
    if (!this.validationPatterns.get("basic_english")!.test(word)) {
      issues.push("Contains non-English characters")
      confidence -= 0.3
    }

    const isKnownWord = COMMON_ENGLISH_WORDS.has(word.toLowerCase())
    if (isKnownWord) {
      // Known words get high confidence automatically
      confidence = 0.95
    } else {
      const looksEnglish = isLikelyEnglishWord(word)
      if (!looksEnglish) {
        issues.push("Does not appear to be a valid English word")
        confidence -= 0.5
        isValid = false
      }
    }

    // التحقق من الصوتيات الإنجليزية
    if (!this.validationPatterns.get("english_phonetics")!.test(word)) {
      issues.push("Unnatural phonetic pattern for English")
      confidence -= 0.2
    }

    // التحقق من التدفق الطبيعي
    if (!this.validationPatterns.get("natural_flow")!.test(word)) {
      issues.push("Unnatural sound flow")
      confidence -= 0.15
    }

    // تجنب الكلمات المبتكرة غير الواقعية
    if (!this.validationPatterns.get("avoid_invented")!.test(word)) {
      issues.push("Appears unnaturally invented")
      confidence -= 0.25
    }

    // حساب درجة الندرة
    const rarityScore = this.calculateRarityScore(word)

    // حساب الإمكانية التسويقية
    const marketPotential = this.calculateMarketPotential(word)

    if (confidence < 0.75) {
      isValid = false
    }

    // إذا كانت الندرة منخفضة جداً، ليست مرغوبة
    if (rarityScore < this.rarityThreshold) {
      issues.push("Too common - not rare enough")
      isValid = false
    }

    return {
      isValid,
      confidence,
      issues,
      suggestions,
      rarityScore,
      marketPotential,
    }
  }

  private calculateRarityScore(word: string): number {
    let score = 0
    const length = word.length

    // كلمات أطول تميل إلى أن تكون أكثر ندرة
    if (length >= 8) score += 0.3
    else if (length >= 6) score += 0.2
    else if (length >= 4) score += 0.1

    // وجود حروف غير شائعة يزيد الندرة
    const uncommonLetters = word.match(/[zjqxkvw]/gi)
    if (uncommonLetters) {
      score += (uncommonLetters.length / length) * 0.4
    }

    // أنماط غير شائعة
    const uncommonPatterns = word.match(/([zxq]{2,}|[aeiou]{3,}|[bcdfghjklmnpqrstvwxyz]{4,})/gi)
    if (uncommonPatterns) {
      score -= 0.2 // أنماط غير طبيعية تقلل الجودة
    }

    return Math.min(1, Math.max(0, score))
  }

  private calculateMarketPotential(word: string): number {
    let potential = 0.5 // نقطة انطلاق متوسطة

    // قابلية النطق
    const pronounceability = this.calculatePronounceability(word)
    potential += pronounceability * 0.3

    // قابلية التذكر
    const memorability = this.calculateMemorability(word)
    potential += memorability * 0.3

    // الاحترافية
    const professionalism = this.calculateProfessionalism(word)
    potential += professionalism * 0.2

    // المرونة اللغوية
    const linguisticFlexibility = this.calculateLinguisticFlexibility(word)
    potential += linguisticFlexibility * 0.2

    return Math.min(1, potential)
  }

  private calculatePronounceability(word: string): number {
    const vowels = (word.match(/[aeiou]/gi) || []).length
    const vowelRatio = vowels / word.length

    let score = 0.5

    // نسبة متوازنة للحروف الصوتية
    if (vowelRatio >= 0.3 && vowelRatio <= 0.5) score += 0.3
    else if (vowelRatio >= 0.25 && vowelRatio <= 0.6) score += 0.15

    // تجنب التجميعات الصعبة
    const hardClusters = word.match(/[bcdfghjklmnpqrstvwxyz]{4,}/gi)
    if (!hardClusters) score += 0.2

    return Math.min(1, score)
  }

  private calculateMemorability(word: string): number {
    let score = 0

    // الطول المثالي للحفظ
    if (word.length >= 4 && word.length <= 8) score += 0.4
    else if (word.length >= 3 && word.length <= 10) score += 0.2

    // أنماط متكررة (تجعل الكلمة أسهل للحفظ)
    const hasPattern = /(.)\1|(..)\2/.test(word)
    if (hasPattern) score += 0.3

    // بداية ونهاية قوية
    const strongStart = /^[b-df-hj-np-tv-z]/i.test(word)
    const strongEnd = /[aeiou][b-df-hj-np-tv-z]$/i.test(word)
    if (strongStart) score += 0.15
    if (strongEnd) score += 0.15

    return Math.min(1, score)
  }

  private calculateProfessionalism(word: string): number {
    let score = 0.5

    // تجنب الكلمات الطفولية
    const childish = /(oo|ee|aa|ii|uu){2,}|[xyz]{3,}/i.test(word)
    if (!childish) score += 0.3

    // مظهر احترافي
    const professional = /^[A-Z]?[a-z]+$/.test(word) && word.length >= 4
    if (professional) score += 0.2

    return Math.min(1, score)
  }

  private calculateLinguisticFlexibility(word: string): number {
    let score = 0

    // إمكانية استخدامها كفعل، اسم، صفة، إلخ
    const canBeVerb = word.length >= 3 && /[aeiou]$/i.test(word)
    const canBeNoun = word.length >= 3 && /[b-df-hj-np-tv-z]$/i.test(word)
    const canBeAdjective = word.length >= 4

    if (canBeVerb) score += 0.2
    if (canBeNoun) score += 0.2
    if (canBeAdjective) score += 0.1

    return Math.min(1, score)
  }

  public learnFromUserInteraction(selectedWords: string[], rejectedWords: string[]) {
    // تحديث تفضيلات المستخدم
    selectedWords.forEach((word) => {
      this.memory.userPreferences.selectedWords.add(word)
      this.extractPatterns(word).forEach((pattern) => {
        if (!this.memory.userPreferences.preferredPatterns.includes(pattern)) {
          this.memory.userPreferences.preferredPatterns.push(pattern)
        }
      })
    })

    rejectedWords.forEach((word) => {
      this.memory.userPreferences.rejectedWords.add(word)
      this.extractPatterns(word).forEach((pattern) => {
        if (!this.memory.userPreferences.avoidedPatterns.includes(pattern)) {
          this.memory.userPreferences.avoidedPatterns.push(pattern)
        }
      })
    })

    this.saveMemory()
  }

  private extractPatterns(word: string): string[] {
    const patterns: string[] = []

    // أنماط الحروف
    if (word.length >= 2) {
      patterns.push(word.slice(0, 2)) // أول حرفين
      patterns.push(word.slice(-2)) // آخر حرفين
    }

    // أنماط صوتية
    const vowelPattern = word.replace(/[bcdfghjklmnpqrstvwxyz]/gi, "C").replace(/[aeiou]/gi, "V")
    patterns.push(vowelPattern)

    return patterns
  }

  private saveMemory() {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "hyperHarvesterMemory",
        JSON.stringify({
          userPreferences: {
            selectedWords: Array.from(this.memory.userPreferences.selectedWords),
            rejectedWords: Array.from(this.memory.userPreferences.rejectedWords),
            preferredPatterns: this.memory.userPreferences.preferredPatterns,
            avoidedPatterns: this.memory.userPreferences.avoidedPatterns,
          },
        }),
      )
    }
  }

  public loadMemory() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hyperHarvesterMemory")
      if (saved) {
        const parsed = JSON.parse(saved)
        this.memory.userPreferences.selectedWords = new Set(parsed.userPreferences.selectedWords)
        this.memory.userPreferences.rejectedWords = new Set(parsed.userPreferences.rejectedWords)
        this.memory.userPreferences.preferredPatterns = parsed.userPreferences.preferredPatterns
        this.memory.userPreferences.avoidedPatterns = parsed.userPreferences.avoidedPatterns
      }
    }
  }
}
