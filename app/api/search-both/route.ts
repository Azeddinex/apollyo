import { NextResponse } from "next/server"
import { SearchEngine } from "@/lib/core/search-engine"
import type { SearchConfig } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { filters, maxResults, depth } = body as Omit<SearchConfig, "mode">

    console.log("[v0] API: Running both modes in parallel")

    const searchEngine = new SearchEngine()
    const results = await searchEngine.searchBoth({
      filters: filters || {},
      maxResults: maxResults || 1000,
      depth: depth || 3,
    })

    console.log("[v0] API: Both modes completed:", {
      speed: results.speed.length,
      hyper: results.hyper.length,
      combined: results.combined.length,
    })

    return NextResponse.json({
      success: true,
      results,
      metadata: {
        speedCount: results.speed.length,
        hyperCount: results.hyper.length,
        combinedCount: results.combined.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] API: Search both error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
