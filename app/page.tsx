use client
import { useState, useEffect } from "react"
import { Search, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import ApollyoLogo from "@/components/apollyo-logo"
import ModeSelector from "@/components/mode-selector"
import FilterPanel from "@/components/filter-panel"
import ResultsManager from "@/components/results-manager"
import ApiSettings from "@/components/api-settings"
import type { OperationMode, WordResult, FlexibleFilters, AdvancedFilters } from "@/lib/types"

export default function AppollyoApp() {
  const [selectedMode, setSelectedMode] = useState<OperationMode>("speed")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<WordResult[]>([])
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<FlexibleFilters | AdvancedFilters>({
    length: { min: 3, max: 12 },
    pattern: {},
  })
  const [maxResults, setMaxResults] = useState(1000)
  const [depth, setDepth] = useState(3)
  const [error, setError] = useState<string | null>(null)
  const [openaiKey, setOpenaiKey] = useState<string | null>(null)

  useEffect(() => {
    const savedKey = localStorage.getItem("apollyo_openai_key")
    if (savedKey) {
      setOpenaiKey(savedKey)
    }
  }, [])

  const handleSearch = async () => {
    setError(null)
    setIsSearching(true)
    setResults([])
    setSelectedWords(new Set())

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000)

      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: selectedMode,
          filters,
          maxResults,
          depth: selectedMode === "hyper" ? depth : undefined,
          openaiKey: openaiKey || undefined,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
        throw new Error(errorData.message || `Server error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.results || !Array.isArray(data.results)) {
        throw new Error("Invalid response format from server")
      }

      setResults(data.results)

      if (data.results.length === 0) {
        setError("No words found matching your filters. Try adjusting your criteria.")
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred"
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "Search timed out. Try reducing the depth or max results."
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "Network error. Please check your connection and try again."
        } else {
          errorMessage = error.message
        }
      }

      setError(errorMessage)
    } finally {
      setIsSearching(false)
    }
  }

  const handleModeChange = (mode: OperationMode) => {
    setSelectedMode(mode)
    setError(null)
    if (mode === "speed") {
      setFilters({
        length: { min: 3, max: 12 },
        pattern: {},
      })
    } else {
      setFilters({
        length: { min: 3, max: 12 },
        pattern: {},
        rarity: { min: 0.3, max: 1 },
        marketPotential: { min: 0.5 },
        linguistic: {
          allowCompounds: true,
          requireVowels: true,
          maxConsonantCluster: 4,
        },
      })
    }
  }

  const handleContactAdmin = () => {
    window.location.href = "mailto:admin@apollyo.com?subject=APOLLYO Support Request"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
        {/* شعار وشرح في الأعلى ومركزان دائماً */}
        <header className="flex flex-col items-center justify-start pt-10 pb-6">
          <ApollyoLogo className="w-10 h-10 sm:w-14 sm:h-14 mb-2" />
          <div className="text-center mt-2">
            <p className="text-sm sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Advanced Word Discovery Platform with AI-Powered Intelligence
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Speed Mode & Hyper Mode for Maximum Flexibility
            </p>
          </div>
        </header>
        {/* باقي الصفحة كما هو */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center text-red-800 dark:text-red-200 font-bold text-xs sm:text-sm">
                !
              </div>
              <div className="flex-1">
                <p className="font-medium text-xs sm:text-sm">Error</p>
                <p className="text-xs sm:text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-lg sm:text-xl"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">Select Operation Mode</h2>
          <ModeSelector selectedMode={selectedMode} onModeChange={handleModeChange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="lg:col-span-2">
            <FilterPanel mode={selectedMode} filters={filters} onFiltersChange={setFilters} />
          </div>

          <div className="space-y-4 sm:space-y-6">
            <ApiSettings onApiKeyChange={setOpenaiKey} />

            <Card className="p-4 sm:p-6">
              <h3 className="text-sm sm:text-lg font-bold mb-3 sm:mb-4">Search Settings</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">Max Results: {maxResults}</label>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={maxResults}
                    onChange={(e) => setMaxResults(Number.parseInt(e.target.value))}
                    className="w-full"
                    disabled={isSearching}
                  />
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    {maxResults < 1000 ? "Fast" : maxResults < 3000 ? "Balanced" : "Comprehensive"}
                  </div>
                </div>

                {selectedMode === "hyper" && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2">Crawl Depth: {depth}</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={depth}
                      onChange={(e) => setDepth(Number.parseInt(e.target.value))}
                      className="w-full"
                      disabled={isSearching}
                    />
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      {depth === 1 ? "Quick" : depth === 3 ? "Standard" : "Deep"}
                    </div>
                  </div>
                )}

                <Button onClick={handleSearch} disabled={isSearching} className="w-full text-xs sm:text-sm" size="lg">
                  {isSearching ? (
                    <> 
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <> 
                      <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Start Search
                    </>
                  )}
                </Button>

                <div className="pt-3 sm:pt-4 border-t space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Mode:</span>
                    <span className="font-medium">{selectedMode === "speed" ? "Speed (Internal)" : "Hyper (Web)"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Filters:</span>
                    <span className="font-medium">{selectedMode === "speed" ? "Flexible Only" : "All Advanced"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Enhanced:</span>
                    <span className="font-medium">{openaiKey ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-2xl font-bold">
                Results ({results.length})
                <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-2">
                  via {selectedMode === "speed" ? "Speed" : "Hyper"} Mode
                </span>
              </h2>
              <div className="text-xs sm:text-sm text-muted-foreground">Selected: {selectedWords.size}</div>
            </div>
            <ResultsManager results={results} selectedWords={selectedWords} onSelectionChange={setSelectedWords} />
          </div>
        )}

        {/* Empty State */}
        {!isSearching && results.length === 0 && !error && (
          <Card className="p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
              <h3 className="text-base sm:text-xl font-bold mb-2">Ready to Discover Words</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                {selectedMode === "speed"
                  ? "Speed Mode will generate words internally using flexible filters only."
                  : "Hyper Mode will scrape the web using all advanced filters for deep discovery."}
              </p>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Configure your filters and click "Start Search" to begin.
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isSearching && (
          <Card className="p-8 sm:p-12 text-center">
            <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-primary animate-spin" />
            <h3 className="text-base sm:text-xl font-bold mb-2">
              {selectedMode === "speed" ? "Generating Words..." : "Crawling the Web..."}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {selectedMode === "speed"
                ? "Using internal patterns to generate high-quality English words."
                : `Scraping web sources with depth ${depth} to find rare and valuable words.`}
            </p>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">This may take a few moments...</div>
          </Card>
        )}

        <div className="mt-8 sm:mt-12 text-center">
          <div className="mb-3 sm:mb-4">
            <Button
              onClick={handleContactAdmin}
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent text-xs sm:text-sm"
            >
              <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
              Contact Admin
            </Button>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            <p className="font-medium">APOLLYO - Advanced Word Discovery Platform</p>
            <p className="mt-1">Speed Mode: Internal Generation | Hyper Mode: Web Scraping</p>
            <p className="mt-2 text-[10px] sm:text-xs">© 2025 APOLLYO.com - All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  )
}