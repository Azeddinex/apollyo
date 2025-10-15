/**
 * Text Filter Agent
 * Advanced text filtering with pattern matching and learning
 */

import { BaseFilterAgent } from './base-filter'
import type { FilterResult } from '../types'

export class TextFilterAgent extends BaseFilterAgent {
  private patterns: RegExp[]
  private learnedPatterns: Set<string> = new Set()
  private blacklistPatterns: Set<string> = new Set()
  
  constructor(
    name: string,
    patterns: string[] = [],
    private minLength: number = 3,
    private maxLength: number = 500
  ) {
    super(name, 2) // Priority 2
    this.patterns = patterns.map(p => new RegExp(p, 'i'))
  }
  
  async apply(data: any, context: any): Promise<FilterResult> {
    const startTime = performance.now()
    
    // Type check
    if (typeof data !== 'string') {
      this.updateMetrics(false, performance.now() - startTime)
      return {
        passed: false,
        confidence: 0,
        reason: 'Data is not a string'
      }
    }
    
    // Length check
    const length = data.length
    if (length < this.minLength || length > this.maxLength) {
      this.updateMetrics(false, performance.now() - startTime)
      return {
        passed: false,
        confidence: 0,
        reason: `Length ${length} is outside range [${this.minLength}, ${this.maxLength}]`
      }
    }
    
    let confidence = 0.5 // Base confidence
    
    // Pattern matching
    const allPatterns = [...this.patterns, ...Array.from(this.learnedPatterns).map(p => new RegExp(p, 'i'))]
    
    if (allPatterns.length > 0) {
      let matches = 0
      for (const pattern of allPatterns) {
        if (pattern.test(data)) {
          matches++
          confidence += 0.1
        }
      }
      
      // Bonus for multiple matches
      if (matches > 2) {
        confidence += 0.1
      }
    }
    
    // Blacklist check
    for (const blacklistPattern of this.blacklistPatterns) {
      const regex = new RegExp(blacklistPattern, 'i')
      if (regex.test(data)) {
        this.updateMetrics(false, performance.now() - startTime)
        return {
          passed: false,
          confidence: 0,
          reason: 'Matched blacklist pattern'
        }
      }
    }
    
    // Quality indicators
    const hasVowels = /[aeiouAEIOU]/.test(data)
    const hasConsonants = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/.test(data)
    const noExcessiveRepetition = !/(.)\1{3,}/.test(data)
    
    if (hasVowels) confidence += 0.1
    if (hasConsonants) confidence += 0.1
    if (noExcessiveRepetition) confidence += 0.1
    
    // Normalize confidence
    confidence = Math.min(1, confidence)
    
    const passed = confidence >= this.adaptationThreshold
    this.updateMetrics(passed, performance.now() - startTime)
    
    return {
      passed,
      confidence,
      reason: passed ? 'Passed all checks' : 'Confidence below threshold'
    }
  }
  
  learn(data: any, feedback: boolean, context: any = {}): void {
    if (typeof data !== 'string') return
    
    this.storeLearningData(data, feedback, context)
    
    if (feedback) {
      // Extract patterns from positive feedback
      const words = data.toLowerCase().match(/\b\w{3,}\b/g) || []
      words.forEach(word => {
        if (word.length >= 3 && word.length <= 15) {
          const pattern = `\\b${word}\\b`
          this.learnedPatterns.add(pattern)
        }
      })
      
      // Adjust threshold down for positive feedback
      this.adaptationThreshold = Math.max(0.5, this.adaptationThreshold - 0.02)
    } else {
      // Add to blacklist for negative feedback
      const pattern = `\\b${data.toLowerCase()}\\b`
      this.blacklistPatterns.add(pattern)
      
      // Adjust threshold up for negative feedback
      this.adaptationThreshold = Math.min(0.9, this.adaptationThreshold + 0.02)
    }
  }
  
  getLearnedPatterns(): string[] {
    return Array.from(this.learnedPatterns)
  }
  
  getBlacklistPatterns(): string[] {
    return Array.from(this.blacklistPatterns)
  }
}