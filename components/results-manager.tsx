"use client"

import { useState, useRef } from "react"
import { Copy, Check, Download, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { WordResult } from "@/lib/types"

interface ResultsManagerProps {
  results: WordResult[]
  selectedWords: Set<string>
  onSelectionChange: (words: Set<string>) => void
}

export default function ResultsManager({ results, selectedWords, onSelectionChange }: ResultsManagerProps) {
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied">("idle")
  const [copyMode, setCopyMode] = useState<"all" | "selected" | "filtered">("selected")
  const [copyFormat, setCopyFormat] = useState<"text" | "json" | "csv">("text")
  const [filters, setFilters] = useState({
    minRarity: 0,
    minMarketPotential: 0,
    minScore: 0.5,
  })

  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const getWordsToCopy = () => {
    let words = results

    if (copyMode === "selected") {
      words = words.filter((word) => selectedWords.has(word.word))
    }

    // تطبيق الفلاتر الإضافية
    words = words.filter((word) => {
      const scores = word.scores || {}
      return (
        (scores.rarity || 0) >= filters.minRarity &&
        (scores.marketPotential || 0) >= filters.minMarketPotential &&
        (scores.overall || 0) >= filters.minScore
      )
    })

    return words.map((w) => w.word)
  }

  const formatWords = (words: string[]) => {
    switch (copyFormat) {
      case "text":
        return words.join("\n")

      case "json":
        return JSON.stringify(
          {
            words: words,
            count: words.length,
            timestamp: new Date().toISOString(),
            metadata: {
              source: "Hyper Harvester Pro",
            },
          },
          null,
          2,
        )

      case "csv":
        return `Word,Length,Rarity,MarketPotential\n${words
          .map((word) => {
            const result = results.find((r) => r.word === word)
            return `"${word}",${word.length},${result?.scores?.rarity || 0},${result?.scores?.marketPotential || 0}`
          })
          .join("\n")}`

      default:
        return words.join("\n")
    }
  }

  const handleCopy = async () => {
    setCopyState("copying")

    try {
      const wordsToCopy = getWordsToCopy()
      const formattedText = formatWords(wordsToCopy)

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(formattedText)
      } else {
        textAreaRef.current!.value = formattedText
        textAreaRef.current!.select()
        document.execCommand("copy")
      }

      setCopyState("copied")
      setTimeout(() => setCopyState("idle"), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      setCopyState("idle")
    }
  }

  const handleDownload = () => {
    const wordsToDownload = getWordsToCopy()
    const formattedText = formatWords(wordsToDownload)
    const blob = new Blob([formattedText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hyper-harvester-${new Date().toISOString().split("T")[0]}.${copyFormat}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleWordSelection = (word: string) => {
    const newSelection = new Set(selectedWords)
    if (newSelection.has(word)) {
      newSelection.delete(word)
    } else {
      newSelection.add(word)
    }
    onSelectionChange(newSelection)
  }

  const selectAll = () => {
    const allWords = new Set(results.map((r) => r.word))
    onSelectionChange(allWords)
  }

  const clearSelection = () => {
    onSelectionChange(new Set())
  }

  const filteredResults = results.filter((word) => {
    const scores = word.scores || {}
    return (
      (scores.rarity || 0) >= filters.minRarity &&
      (scores.marketPotential || 0) >= filters.minMarketPotential &&
      (scores.overall || 0) >= filters.minScore
    )
  })

  return (
    <div className="space-y-6">
      {/* شريط التحكم في النسخ */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Copy:</span>
              <select
                value={copyMode}
                onChange={(e) => setCopyMode(e.target.value as any)}
                className="px-3 py-1 border rounded text-sm bg-background"
              >
                <option value="selected">Selected ({selectedWords.size})</option>
                <option value="all">All Results ({results.length})</option>
                <option value="filtered">Filtered ({filteredResults.length})</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Format:</span>
              <select
                value={copyFormat}
                onChange={(e) => setCopyFormat(e.target.value as any)}
                className="px-3 py-1 border rounded text-sm bg-background"
              >
                <option value="text">Text</option>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopy}
              disabled={copyState === "copying" || getWordsToCopy().length === 0}
              variant="default"
              size="sm"
            >
              {copyState === "copied" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copyState === "copying" ? "Copying..." : copyState === "copied" ? "Copied!" : "Copy"}
            </Button>

            <Button onClick={handleDownload} disabled={getWordsToCopy().length === 0} variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>

            <Button onClick={selectAll} variant="outline" size="sm">
              Select All
            </Button>
            <Button onClick={clearSelection} variant="outline" size="sm">
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* فلاتر متقدمة */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Min Rarity: {filters.minRarity.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.minRarity}
              onChange={(e) => setFilters({ ...filters, minRarity: Number.parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Min Market Potential: {filters.minMarketPotential.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.minMarketPotential}
              onChange={(e) => setFilters({ ...filters, minMarketPotential: Number.parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Min Score: {filters.minScore.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.minScore}
              onChange={(e) => setFilters({ ...filters, minScore: Number.parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* شبكة النتائج */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResults.slice(0, 500).map((result, index) => (
          <Card
            key={index}
            onClick={() => toggleWordSelection(result.word)}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedWords.has(result.word) ? "ring-2 ring-primary bg-primary/5" : "hover:ring-1 hover:ring-border"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="font-bold text-lg">{result.word}</div>
              <div className="flex items-center gap-1">
                <Star
                  size={16}
                  className={selectedWords.has(result.word) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>Length: {result.word.length}</div>
              <div>Sources: {result.metadata.sources?.length || 1}</div>

              {result.scores && (
                <>
                  <div className="text-blue-600">Rarity: {(result.scores.rarity || 0).toFixed(2)}</div>
                  <div className="text-green-600">Market: {(result.scores.marketPotential || 0).toFixed(2)}</div>
                </>
              )}
            </div>

            <div
              className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                result.source === "generated" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"
              }`}
            >
              {result.source === "generated" ? "⚡ Speed" : "🌐 Hyper"}
            </div>

            {result.metadata.validation?.issues && result.metadata.validation.issues.length > 0 && (
              <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                {result.metadata.validation.issues.slice(0, 2).join(", ")}
              </div>
            )}
          </Card>
        ))}
      </div>

      <textarea ref={textAreaRef} className="absolute opacity-0 -left-full" aria-hidden="true" />
    </div>
  )
}
