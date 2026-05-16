import type { LanguageModel } from 'ai';
import { createMinimaxOpenAI } from 'vercel-minimax-ai-provider';
import { env, hasMiniMax } from './env.js';

let provider: ReturnType<typeof createMinimaxOpenAI> | null = null;

export function getMinimaxModel(): LanguageModel {
  if (!hasMiniMax()) {
    throw new Error('MiniMax API key not configured');
  }
  if (!provider) {
    provider = createMinimaxOpenAI({
      apiKey: env.minimaxApiKey,
      baseURL: env.minimaxBaseUrl,
    });
  }
  return provider(env.minimaxModel);
}
