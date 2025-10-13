"use client"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { OperationMode, FlexibleFilters, AdvancedFilters, DomainCategory } from "@/lib/types"

interface FilterPanelProps {
  mode: OperationMode
  filters: FlexibleFilters | AdvancedFilters
  onFiltersChange: (filters: FlexibleFilters | AdvancedFilters) => void
}

const DOMAIN_CATEGORIES: { value: DomainCategory; label: string; emoji: string }[] = [
  { value: "technology", label: "Technology", emoji: "💻" },
  { value: "business", label: "Business", emoji: "💼" },
  { value: "health", label: "Health", emoji: "🏥" },
  { value: "education", label: "Education", emoji: "📚" },
  { value: "finance", label: "Finance", emoji: "💰" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "sports", label: "Sports", emoji: "⚽" },
  { value: "travel", label: "Travel", emoji: "✈️" },
  { value: "food", label: "Food", emoji: "🍔" },
  { value: "fashion", label: "Fashion", emoji: "👗" },
  { value: "real-estate", label: "Real Estate", emoji: "🏠" },
  { value: "automotive", label: "Automotive", emoji: "🚗" },
  { value: "gaming", label: "Gaming", emoji: "🎮" },
  { value: "social", label: "Social", emoji: "👥" },
  { value: "ecommerce", label: "E-commerce", emoji: "🛒" },
  { value: "saas", label: "SaaS", emoji: "☁️" },
  { value: "consulting", label: "Consulting", emoji: "📊" },
  { value: "creative", label: "Creative", emoji: "🎨" },
  { value: "general", label: "General", emoji: "🌐" },
]

export default function FilterPanel({ mode, filters, onFiltersChange }: FilterPanelProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const updateNestedFilter = (parent: string, key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [parent]: {
        ...(filters as any)[parent],
        [key]: value,
      },
    })
  }

  const toggleDomainCategory = (category: DomainCategory) => {
    const currentCategories = (filters as AdvancedFilters).domainCategory || []
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category]
    updateFilter("domainCategory", newCategories)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{mode === "speed" ? "⚡ Flexible Filters" : "🌐 Advanced Filters"}</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
          {mode === "speed" ? "Speed Mode" : "Hyper Mode"}
        </span>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="basic" className="text-xs sm:text-sm">
            Basic
          </TabsTrigger>
          <TabsTrigger value="phonetic" className="text-xs sm:text-sm">
            Phonetic
          </TabsTrigger>
          {mode === "hyper" && (
            <TabsTrigger value="categories" className="text-xs sm:text-sm">
              Categories
            </TabsTrigger>
          )}
          {mode === "hyper" && (
            <TabsTrigger value="advanced" className="text-xs sm:text-sm">
              Advanced
            </TabsTrigger>
          )}
        </TabsList>

        {/* Basic Filters Tab */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Length Range</Label>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Minimum Length</Label>
                  <span className="text-sm font-bold text-primary">{filters.length?.min || 3}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={filters.length?.min || 3}
                  onChange={(e) => updateNestedFilter("length", "min", Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Maximum Length</Label>
                  <span className="text-sm font-bold text-primary">{filters.length?.max || 12}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={filters.length?.max || 12}
                  onChange={(e) => updateNestedFilter("length", "max", Number.parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Pattern Filters</Label>
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-muted-foreground">Starts With</Label>
                <Input
                  type="text"
                  placeholder="e.g., app"
                  value={filters.pattern?.startsWith || ""}
                  onChange={(e) => updateNestedFilter("pattern", "startsWith", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Ends With</Label>
                <Input
                  type="text"
                  placeholder="e.g., ly"
                  value={filters.pattern?.endsWith || ""}
                  onChange={(e) => updateNestedFilter("pattern", "endsWith", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Contains</Label>
                <Input
                  type="text"
                  placeholder="e.g., tech"
                  value={filters.pattern?.contains || ""}
                  onChange={(e) => updateNestedFilter("pattern", "contains", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Excludes</Label>
                <Input
                  type="text"
                  placeholder="e.g., xyz"
                  value={filters.pattern?.excludes || ""}
                  onChange={(e) => updateNestedFilter("pattern", "excludes", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Phonetic Filters Tab */}
        <TabsContent value="phonetic" className="space-y-4 mt-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Vowel Ratio</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">
                  Min: {(filters.phonetic?.vowelRatio?.min || 0.2).toFixed(1)}
                </Label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={filters.phonetic?.vowelRatio?.min || 0.2}
                  onChange={(e) =>
                    updateNestedFilter("phonetic", "vowelRatio", {
                      ...(filters.phonetic?.vowelRatio || {}),
                      min: Number.parseFloat(e.target.value),
                    })
                  }
                  className="w-full mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Max: {(filters.phonetic?.vowelRatio?.max || 0.6).toFixed(1)}
                </Label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={filters.phonetic?.vowelRatio?.max || 0.6}
                  onChange={(e) =>
                    updateNestedFilter("phonetic", "vowelRatio", {
                      ...(filters.phonetic?.vowelRatio || {}),
                      max: Number.parseFloat(e.target.value),
                    })
                  }
                  className="w-full mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Allow Double Consonants</Label>
            <Switch
              checked={filters.phonetic?.allowDoubleConsonants ?? true}
              onCheckedChange={(checked) => updateNestedFilter("phonetic", "allowDoubleConsonants", checked)}
            />
          </div>

          {mode === "hyper" && (
            <>
              <div>
                <Label className="text-sm font-medium mb-2 block">Preferred Sounds</Label>
                <Input
                  type="text"
                  placeholder="e.g., sh, ch, th (comma separated)"
                  value={(filters as AdvancedFilters).phonetic?.preferredSounds?.join(", ") || ""}
                  onChange={(e) =>
                    updateNestedFilter(
                      "phonetic",
                      "preferredSounds",
                      e.target.value.split(",").map((s) => s.trim()),
                    )
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Avoid Sounds</Label>
                <Input
                  type="text"
                  placeholder="e.g., zx, qw (comma separated)"
                  value={(filters as AdvancedFilters).phonetic?.avoidSounds?.join(", ") || ""}
                  onChange={(e) =>
                    updateNestedFilter(
                      "phonetic",
                      "avoidSounds",
                      e.target.value.split(",").map((s) => s.trim()),
                    )
                  }
                  className="mt-1"
                />
              </div>
            </>
          )}
        </TabsContent>

        {mode === "hyper" && (
          <TabsContent value="categories" className="space-y-4 mt-4">
            <div className="text-sm font-medium text-primary mb-2">🎯 Select Domain Categories</div>
            <p className="text-xs text-muted-foreground mb-4">
              Choose one or more categories to focus your search. Leave empty for all categories.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DOMAIN_CATEGORIES.map((category) => {
                const isSelected = (filters as AdvancedFilters).domainCategory?.includes(category.value) || false
                return (
                  <button
                    key={category.value}
                    onClick={() => toggleDomainCategory(category.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:border-primary/50 hover:bg-muted"
                    }`}
                  >
                    <span className="text-lg">{category.emoji}</span>
                    <span className="text-xs">{category.label}</span>
                  </button>
                )
              })}
            </div>

            {(filters as AdvancedFilters).domainCategory && (filters as AdvancedFilters).domainCategory!.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="text-xs font-medium mb-2">Selected Categories:</div>
                <div className="flex flex-wrap gap-2">
                  {(filters as AdvancedFilters).domainCategory!.map((cat) => {
                    const category = DOMAIN_CATEGORIES.find((c) => c.value === cat)
                    return (
                      <Badge key={cat} variant="secondary" className="gap-1">
                        <span>{category?.emoji}</span>
                        <span>{category?.label}</span>
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}
          </TabsContent>
        )}

        {/* Advanced Filters Tab - Only in Hyper Mode */}
        {mode === "hyper" && (
          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="text-sm font-medium text-primary mb-2">🌐 Hyper Mode Exclusive Filters</div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Rarity Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Min: {((filters as AdvancedFilters).rarity?.min || 0).toFixed(1)}
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={(filters as AdvancedFilters).rarity?.min || 0}
                    onChange={(e) => updateNestedFilter("rarity", "min", Number.parseFloat(e.target.value))}
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Max: {((filters as AdvancedFilters).rarity?.max || 1).toFixed(1)}
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={(filters as AdvancedFilters).rarity?.max || 1}
                    onChange={(e) => updateNestedFilter("rarity", "max", Number.parseFloat(e.target.value))}
                    className="w-full mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Market Potential: {((filters as AdvancedFilters).marketPotential?.min || 0).toFixed(1)}
              </Label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={(filters as AdvancedFilters).marketPotential?.min || 0}
                onChange={(e) => updateNestedFilter("marketPotential", "min", Number.parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Pronunciation</Label>
              <div className="space-y-2">
                <select
                  value={(filters as AdvancedFilters).pronunciation?.difficulty || "any"}
                  onChange={(e) => updateNestedFilter("pronunciation", "difficulty", e.target.value)}
                  className="w-full px-3 py-2 border rounded bg-background"
                >
                  <option value="any">Any Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Min Syllables</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={(filters as AdvancedFilters).pronunciation?.syllableCount?.min || 1}
                      onChange={(e) =>
                        updateNestedFilter("pronunciation", "syllableCount", {
                          ...(filters as AdvancedFilters).pronunciation?.syllableCount,
                          min: Number.parseInt(e.target.value),
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Max Syllables</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={(filters as AdvancedFilters).pronunciation?.syllableCount?.max || 5}
                      onChange={(e) =>
                        updateNestedFilter("pronunciation", "syllableCount", {
                          ...(filters as AdvancedFilters).pronunciation?.syllableCount,
                          max: Number.parseInt(e.target.value),
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Memorability</Label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={(filters as AdvancedFilters).memorability?.min || 0}
                onChange={(e) => updateNestedFilter("memorability", "min", Number.parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Brandability</Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Min Score: {((filters as AdvancedFilters).brandability?.minScore || 0).toFixed(1)}
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={(filters as AdvancedFilters).brandability?.minScore || 0}
                    onChange={(e) => updateNestedFilter("brandability", "minScore", Number.parseFloat(e.target.value))}
                    className="w-full mt-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Require Unique</Label>
                  <Switch
                    checked={(filters as AdvancedFilters).brandability?.requireUnique ?? false}
                    onCheckedChange={(checked) => updateNestedFilter("brandability", "requireUnique", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Check Trademark</Label>
                  <Switch
                    checked={(filters as AdvancedFilters).brandability?.checkTrademark ?? false}
                    onCheckedChange={(checked) => updateNestedFilter("brandability", "checkTrademark", checked)}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium block">Linguistic Options</Label>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Allow Compounds</Label>
                <Switch
                  checked={(filters as AdvancedFilters).linguistic?.allowCompounds ?? true}
                  onCheckedChange={(checked) => updateNestedFilter("linguistic", "allowCompounds", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Require Vowels</Label>
                <Switch
                  checked={(filters as AdvancedFilters).linguistic?.requireVowels ?? true}
                  onCheckedChange={(checked) => updateNestedFilter("linguistic", "requireVowels", checked)}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Max Consonant Cluster</Label>
                <Input
                  type="number"
                  min={2}
                  max={6}
                  value={(filters as AdvancedFilters).linguistic?.maxConsonantCluster || 4}
                  onChange={(e) =>
                    updateNestedFilter("linguistic", "maxConsonantCluster", Number.parseInt(e.target.value))
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Quality Control</Label>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Min Confidence: {((filters as AdvancedFilters).quality?.minConfidence || 0.6).toFixed(1)}
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={(filters as AdvancedFilters).quality?.minConfidence || 0.6}
                    onChange={(e) => updateNestedFilter("quality", "minConfidence", Number.parseFloat(e.target.value))}
                    className="w-full mt-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Require Natural Flow</Label>
                  <Switch
                    checked={(filters as AdvancedFilters).quality?.requireNaturalFlow ?? true}
                    onCheckedChange={(checked) => updateNestedFilter("quality", "requireNaturalFlow", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Exclude Gibberish</Label>
                  <Switch
                    checked={(filters as AdvancedFilters).quality?.excludeGibberish ?? true}
                    onCheckedChange={(checked) => updateNestedFilter("quality", "excludeGibberish", checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </Card>
  )
}
