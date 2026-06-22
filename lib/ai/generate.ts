import { generateWithGemini } from './gemini'
import { generateWithClaude } from './claude'

export async function generate(prompt: string, claudeApiKey?: string | null): Promise<string> {
  if (claudeApiKey) {
    return generateWithClaude(prompt, claudeApiKey)
  }
  return generateWithGemini(prompt)
}
