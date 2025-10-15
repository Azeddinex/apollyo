/**
 * Base Filter Agent
 * Abstract base class for all filter agents
 */

import type { FilterAgent, FilterResult, FilterStats, LearningData } from '../types'

export abstract class BaseFilterAgent implements FilterAgent {
  public isActive: boolean = true
  
  protected metrics = {
    totalProcessed: 0,
    successful: 0,
    failed: 0,
    processingTimes: [] as number[]
  }
  
  protected learningData: LearningData[] = []
  protected adaptationThreshold: number = 0.7
  
  constructor(
    public name: string,
    public priority: number = 1
  ) {}
  
  abstract apply(data: any, context: any): Promise<FilterResult>
  
  abstract learn(data: any, feedback: boolean, context?: any): void
  
  getStats(): FilterStats {
    const avgProcessingTime = this.metrics.processingTimes.length > 0
      ? this.metrics.processingTimes.reduce((a, b) => a + b, 0) / this.metrics.processingTimes.length
      : 0
    
    const successRate = this.metrics.totalProcessed > 0
      ? this.metrics.successful / this.metrics.totalProcessed
      : 0
    
    return {
      name: this.name,
      priority: this.priority,
      totalProcessed: this.metrics.totalProcessed,
      successful: this.metrics.successful,
      failed: this.metrics.failed,
      successRate,
      avgProcessingTime
    }
  }
  
  protected updateMetrics(passed: boolean, processingTime: number): void {
    this.metrics.totalProcessed++
    this.metrics.processingTimes.push(processingTime)
    
    // Keep only last 100 processing times
    if (this.metrics.processingTimes.length > 100) {
      this.metrics.processingTimes.shift()
    }
    
    if (passed) {
      this.metrics.successful++
    } else {
      this.metrics.failed++
    }
  }
  
  protected getSuccessRate(): number {
    return this.metrics.totalProcessed > 0
      ? this.metrics.successful / this.metrics.totalProcessed
      : 0
  }
  
  protected storeLearningData(data: any, feedback: boolean, context: any = {}): void {
    this.learningData.push({
      data,
      feedback,
      context,
      timestamp: Date.now()
    })
    
    // Keep only last 1000 learning samples
    if (this.learningData.length > 1000) {
      this.learningData.shift()
    }
  }
}