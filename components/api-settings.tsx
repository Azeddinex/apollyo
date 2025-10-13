"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Key, Eye, EyeOff, Check, X } from "lucide-react"

interface ApiSettingsProps {
  onApiKeyChange: (apiKey: string | null) => void
}

export default function ApiSettings({ onApiKeyChange }: ApiSettingsProps) {
  const [apiKey, setApiKey] = useState<string>("")
  const [showKey, setShowKey] = useState(false)
  const [isSet, setIsSet] = useState(false)

  const handleSave = () => {
    if (apiKey.trim()) {
      onApiKeyChange(apiKey.trim())
      setIsSet(true)
      localStorage.setItem("apollyo_openai_key", apiKey.trim())
    }
  }

  const handleClear = () => {
    setApiKey("")
    setIsSet(false)
    onApiKeyChange(null)
    localStorage.removeItem("apollyo_openai_key")
  }

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-background to-muted/20">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Key className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        <h3 className="text-sm sm:text-lg font-bold">OpenAI API (Optional)</h3>
      </div>

      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
        Add your OpenAI API key to enhance the internal agent with advanced AI capabilities.
      </p>

      <div className="space-y-3">
        <div className="relative">
          <Input
            type={showKey ? "text" : "password"}
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isSet}
            className="pr-10 text-xs sm:text-sm"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex gap-2">
          {!isSet ? (
            <Button onClick={handleSave} disabled={!apiKey.trim()} size="sm" className="flex-1 text-xs sm:text-sm">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Save Key
            </Button>
          ) : (
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              className="flex-1 text-xs sm:text-sm bg-transparent"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Clear Key
            </Button>
          )}
        </div>

        {isSet && (
          <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
            <Check className="w-3 h-3" />
            API key configured - Agent will use advanced AI
          </div>
        )}
      </div>
    </Card>
  )
}
