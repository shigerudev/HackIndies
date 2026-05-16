import { hasMiniMax, env } from './env.js';

const EMBEDDING_MODEL = 'embo-01';

/**
 * Embed a query string using MiniMax text-embedding API.
 * Returns null if MiniMax is not configured.
 */
export async function embedQuery(text: string): Promise<number[] | null> {
  if (!hasMiniMax()) return null;

  try {
    const response = await fetch(`${env.minimaxBaseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.minimaxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text,
      }),
    });

    if (!response.ok) {
      console.warn('[embeddings] MiniMax embedding failed:', response.status);
      return null;
    }

    const data = await response.json() as { data: { embedding: number[] }[] };
    return data.data[0]?.embedding ?? null;
  } catch (err) {
    console.warn('[embeddings] embedQuery error:', err);
    return null;
  }
}