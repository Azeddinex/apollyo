import { NextResponse } from "next/server"
import { SearchEngine } from "@/lib/core/search-engine"
import { EnhancedFilterAnalyzer } from "@/lib/agent/enhanced-filter-analyzer"
import type { SearchConfig } from "@/lib/types"

const REQUEST_TIMEOUT = 120000 // 2 minutes
const MAX_RESULTS_LIMIT = 10000
const MIN_RESULTS_LIMIT = 10

function validateSearchConfig(config: Partial<SearchConfig>): { valid: boolean; error?: string } {
  if (!config.mode || !["speed", "hyper"].includes(config.mode)) {
    return { valid: false, error: "Invalid mode. Must be 'speed' or 'hyper'" }
  }

  if (config.maxResults && (config.maxResults < MIN_RESULTS_LIMIT || config.maxResults > MAX_RESULTS_LIMIT)) {
    return {
      valid: false,
      error: `Max results must be between ${MIN_RESULTS_LIMIT} and ${MAX_RESULTS_LIMIT}`,
    }
  }

  if (config.depth && (config.depth < 1 || config.depth > 5)) {
    return { valid: false, error: "Depth must be between 1 and 5" }
  }

  if (config.filters?.length) {
    const { min, max } = config.filters.length
    if (min && max && min > max) {
      return { valid: false, error: "Length min cannot be greater than max" }
    }
    if (min && min < 1) {
      return { valid: false, error: "Length min must be at least 1" }
    }
    if (max && max > 50) {
      return { valid: false, error: "Length max cannot exceed 50" }
    }
  }

  return { valid: true }
}

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    console.log("[v0] API: Received search request")

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), REQUEST_TIMEOUT)
    })

    const bodyPromise = request.json()
    const body = (await Promise.race([bodyPromise, timeoutPromise])) as SearchConfig & { openaiKey?: string }

    const { mode, filters, maxResults, depth, openaiKey } = body

    console.log("[v0] API: Parsed request:", { mode, maxResults, depth, hasOpenAI: !!openaiKey })

    const validation = validateSearchConfig({ mode, filters, maxResults, depth })
    if (!validation.valid) {
      console.log("[v0] API: Validation failed:", validation.error)
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    let optimizedFilters
    try {
      optimizedFilters = EnhancedFilterAnalyzer.optimizeFilters(filters || {}, mode)
      console.log("[v0] API: Filters optimized successfully")
    } catch (filterError) {
      console.error("[v0] API: Filter optimization error:", filterError)
      return NextResponse.json(
        {
          error: "Filter optimization failed",
          message: filterError instanceof Error ? filterError.message : "Invalid filter configuration",
        },
        { status: 400 },
      )
    }

    const searchEngine = new SearchEngine()
    let results

    try {
      const searchPromise = searchEngine.search(
        {
          mode,
          filters: optimizedFilters,
          maxResults: maxResults || 1000,
          depth: depth || 3,
        },
        openaiKey,
      )

      results = await Promise.race([searchPromise, timeoutPromise])
      console.log("[v0] API: Search completed with", results.length, "results")
    } catch (searchError) {
      console.error("[v0] API: Search execution error:", searchError)

      if (searchError instanceof Error && searchError.message === "Request timeout") {
        return NextResponse.json(
          {
            error: "Search timeout",
            message: "The search took too long. Try reducing depth or max results.",
          },
          { status: 408 },
        )
      }

      throw searchError
    }

    if (!Array.isArray(results)) {
      console.error("[v0] API: Invalid results format")
      return NextResponse.json(
        {
          error: "Invalid results",
          message: "Search engine returned invalid data",
        },
        { status: 500 },
      )
    }

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      results,
      metadata: {
        count: results.length,
        mode,
        timestamp: new Date().toISOString(),
        duration: `${(duration / 1000).toFixed(2)}s`,
        aiEnhanced: !!openaiKey,
        filters: {
          applied: Object.keys(optimizedFilters).length,
          mode: mode === "speed" ? "flexible" : "advanced",
        },
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error("[v0] API: Unexpected error:", error)

    let statusCode = 500
    let errorMessage = "Internal server error"
    let userMessage = "An unexpected error occurred. Please try again."

    if (error instanceof SyntaxError) {
      statusCode = 400
      errorMessage = "Invalid JSON"
      userMessage = "Invalid request format. Please check your input."
    } else if (error instanceof Error) {
      errorMessage = error.message

      if (error.message.includes("timeout")) {
        statusCode = 408
        userMessage = "Request timed out. Try reducing complexity."
      } else if (error.message.includes("memory")) {
        statusCode = 507
        userMessage = "Insufficient resources. Try reducing max results."
      } else if (error.message.includes("network")) {
        statusCode = 503
        userMessage = "Network error. Please check your connection."
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        message: userMessage,
        metadata: {
          duration: `${(duration / 1000).toFixed(2)}s`,
          timestamp: new Date().toISOString(),
        },
      },
      { status: statusCode },
    )
  }
}
