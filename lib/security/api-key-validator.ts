export class ApiKeyValidator {
  private static readonly OPENAI_KEY_PATTERN = /^sk-[a-zA-Z0-9]{48}$/
  
  static validateOpenAIKey(key: string): { valid: boolean; error?: string } {
    if (!key) {
      return { valid: false, error: 'API key is required' }
    }
    
    if (!this.OPENAI_KEY_PATTERN.test(key)) {
      return { valid: false, error: 'Invalid API key format' }
    }
    
    return { valid: true }
  }
  
  static sanitizeKey(key: string): string {
    return key.trim().replace(/\s+/g, '')
  }
  
  static maskKey(key: string): string {
    if (key.length < 10) return '***'
    return `${key.substring(0, 7)}...${key.substring(key.length - 4)}`
  }
}