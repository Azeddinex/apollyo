import { NextResponse } from "next/server"
import { InternalIntelligenceAgent } from "@/lib/agent/internal-intelligence"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { words } = body as { words: string[] }

    if (!Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ error: "Invalid words parameter" }, { status: 400 })
    }

    const agent = new InternalIntelligenceAgent()
    const validations = words.map((word) => ({
      word,
      validation: agent.validateEnglishWord(word),
    }))

    return NextResponse.json({
      success: true,
      validations,
      metadata: {
        count: validations.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Validation API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
