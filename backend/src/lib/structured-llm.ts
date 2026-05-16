import { generateObject, generateText } from 'ai';
import type { LanguageModel } from 'ai';
import type { z } from 'zod';
import { getMinimaxModel } from './minimax.js';

const LLM_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS ?? 45_000);

export async function generateStructured<T extends z.ZodTypeAny>(params: {
  system: string;
  prompt: string;
  schema: T;
  temperature?: number;
}): Promise<z.infer<T>> {
  const model: LanguageModel = getMinimaxModel();
  const abortSignal = AbortSignal.timeout(LLM_TIMEOUT_MS);

  try {
    const { object } = await generateObject({
      model,
      schema: params.schema,
      system: params.system,
      prompt: params.prompt,
      temperature: params.temperature ?? 0.2,
      abortSignal,
    });
    return object;
  } catch {
    const { text } = await generateText({
      model,
      system: `${params.system}\n\nRespondé ÚNICAMENTE con JSON válido que cumpla el schema solicitado.`,
      prompt: params.prompt,
      temperature: 0.1,
      abortSignal,
    });
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Model did not return JSON');
    const parsed = JSON.parse(match[0]);
    return params.schema.parse(parsed);
  }
}
