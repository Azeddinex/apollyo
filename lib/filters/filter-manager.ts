import type { FlexibleFilters, AdvancedFilters, OperationMode } from "@/lib/types"

export class FilterManager {
  public static getFiltersForMode(
    mode: OperationMode,
    userFilters: Partial<AdvancedFilters>,
  ): FlexibleFilters | AdvancedFilters {
    if (mode === "speed") {
      // في Speed Mode: فلاتر مرنة فقط
      return this.extractFlexibleFilters(userFilters)
    } else {
      // في Hyper Mode: كل الفلاتر المتقدمة
      return this.buildAdvancedFilters(userFilters)
    }
  }

  private static extractFlexibleFilters(userFilters: Partial<AdvancedFilters>): FlexibleFilters {
    return {
      length: userFilters.length || { min: 3, max: 12 },
      pattern: userFilters.pattern || {},
    }
  }

  private static buildAdvancedFilters(userFilters: Partial<AdvancedFilters>): AdvancedFilters {
    return {
      // الفلاتر المرنة الأساسية
      length: userFilters.length || { min: 3, max: 12 },
      pattern: userFilters.pattern || {},

      // الفلاتر المتقدمة
      rarity: userFilters.rarity || { min: 0.3, max: 1 },
      marketPotential: userFilters.marketPotential || { min: 0.5 },
      pronunciation: userFilters.pronunciation,
      memorability: userFilters.memorability,
      linguistic: userFilters.linguistic || {
        allowCompounds: true,
        requireVowels: true,
        maxConsonantCluster: 4,
      },
    }
  }

  public static validateFilters(
    filters: FlexibleFilters | AdvancedFilters,
    mode: OperationMode,
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // التحقق من فلاتر الطول
    if (filters.length) {
      if (filters.length.min < 1) {
        errors.push("Minimum length must be at least 1")
      }
      if (filters.length.max > 20) {
        errors.push("Maximum length cannot exceed 20")
      }
      if (filters.length.min > filters.length.max) {
        errors.push("Minimum length cannot be greater than maximum length")
      }
    }

    // التحقق من الفلاتر المتقدمة في Hyper Mode
    if (mode === "hyper") {
      const advancedFilters = filters as AdvancedFilters

      if (advancedFilters.rarity) {
        if (advancedFilters.rarity.min < 0 || advancedFilters.rarity.min > 1) {
          errors.push("Rarity min must be between 0 and 1")
        }
        if (advancedFilters.rarity.max < 0 || advancedFilters.rarity.max > 1) {
          errors.push("Rarity max must be between 0 and 1")
        }
      }

      if (advancedFilters.marketPotential) {
        if (advancedFilters.marketPotential.min < 0 || advancedFilters.marketPotential.min > 1) {
          errors.push("Market potential min must be between 0 and 1")
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}
