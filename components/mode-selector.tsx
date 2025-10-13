"use client"
import { Card } from "@/components/ui/card"
import { Zap, Globe } from "lucide-react"
import type { OperationMode } from "@/lib/types"

interface ModeSelectorProps {
  selectedMode: OperationMode
  onModeChange: (mode: OperationMode) => void
}

export default function ModeSelector({ selectedMode, onModeChange }: ModeSelectorProps) {
  const modes = [
    {
      id: "speed" as OperationMode,
      name: "Speed Mode",
      description: "Internal generation with flexible filters",
      icon: Zap,
      color: "from-purple-500 to-pink-500",
      features: ["Internal generation", "Flexible filters", "Fast results"],
    },
    {
      id: "hyper" as OperationMode,
      name: "Hyper Mode",
      description: "Web scraping with advanced filters",
      icon: Globe,
      color: "from-blue-500 to-cyan-500",
      features: ["Web scraping", "Advanced filters", "Deep crawling"],
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {modes.map((mode) => {
        const Icon = mode.icon
        return (
          <Card
            key={mode.id}
            className={`p-3 sm:p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedMode === mode.id ? "ring-2 ring-primary shadow-lg" : "hover:ring-1 hover:ring-border"
            }`}
            onClick={() => onModeChange(mode.id)}
          >
            <div className="flex items-start justify-between mb-2 sm:mb-4">
              <div className={`bg-gradient-to-r ${mode.color} p-2 rounded-lg`}>
                <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              {selectedMode === mode.id && (
                <div className="px-2 py-0.5 sm:py-1 bg-primary text-primary-foreground text-[10px] sm:text-xs rounded-full">
                  Active
                </div>
              )}
            </div>

            <h3 className="text-sm sm:text-lg font-bold mb-1 sm:mb-2">{mode.name}</h3>
            <p className="text-[10px] sm:text-sm text-muted-foreground mb-2 sm:mb-4 line-clamp-2">{mode.description}</p>

            <div className="space-y-1 sm:space-y-2">
              {mode.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground"
                >
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="line-clamp-1">{feature}</span>
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
