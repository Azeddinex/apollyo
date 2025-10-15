export class InputSanitizer {
  static sanitizeString(input: string, maxLength: number = 100): string {
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, '') // إزالة HTML tags
      .replace(/[^\w\s-]/g, '') // السماح فقط بالأحرف والأرقام والمسافات والشرطات
  }
  
  static sanitizeNumber(input: number, min: number, max: number): number {
    const num = Number(input)
    if (isNaN(num)) return min
    return Math.max(min, Math.min(max, num))
  }
  
  static sanitizeFilters(filters: any): any {
    const sanitized: any = {}
    
    if (filters.length) {
      sanitized.length = {
        min: this.sanitizeNumber(filters.length.min, 1, 50),
        max: this.sanitizeNumber(filters.length.max, 1, 50)
      }
    }
    
    if (filters.pattern) {
      sanitized.pattern = {}
      if (filters.pattern.startsWith) {
        sanitized.pattern.startsWith = this.sanitizeString(filters.pattern.startsWith, 10)
      }
      if (filters.pattern.endsWith) {
        sanitized.pattern.endsWith = this.sanitizeString(filters.pattern.endsWith, 10)
      }
      if (filters.pattern.contains) {
        sanitized.pattern.contains = this.sanitizeString(filters.pattern.contains, 10)
      }
      if (filters.pattern.excludes) {
        sanitized.pattern.excludes = this.sanitizeString(filters.pattern.excludes, 10)
      }
    }
    
    // نسخ باقي الفلاتر كما هي
    if (filters.rarity) {
      sanitized.rarity = filters.rarity
    }
    if (filters.marketPotential) {
      sanitized.marketPotential = filters.marketPotential
    }
    if (filters.linguistic) {
      sanitized.linguistic = filters.linguistic
    }
    
    return sanitized
  }
}