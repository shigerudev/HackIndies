import { generateObject } from 'ai';
import { z } from 'zod';
import { hasMiniMax, env } from '../../lib/env.js';
import { RouterInputSchema, RouterOutputSchema } from './schema.js';
import { ROUTER_SYSTEM_PROMPT, ROUTER_USER_PROMPT_TEMPLATE } from './prompt.js';
import { getMinimaxModel } from '../../lib/minimax.js';

function buildHistory(history?: { role: string; content: string }[]): string {
  if (!history?.length) return 'Sin historial previo.';
  return history
    .slice(-2)
    .map((m) => `${m.role}: "${m.content.substring(0, 100)}"`)
    .join('\n');
}

export async function routeMessage(
  message: string,
  history?: { role: string; content: string }[],
): Promise<{ agent: string; confidence: number; reasoning_brief: string }> {
  const parsed = RouterInputSchema.safeParse({ message, conversation_history: history });
  if (!parsed.success) {
    return { agent: 'unknown', confidence: 0, reasoning_brief: 'Input inválido' };
  }

  const userPrompt = ROUTER_USER_PROMPT_TEMPLATE
    .replace('{message}', message)
    .replace('{history}', buildHistory(history));

  if (!hasMiniMax()) {
    // Heuristic fallback — classify by keyword density
    const lower = message.toLowerCase();
    const citizenKW = ['correo', 'contraseña', 'hackeado', 'comprometido', 'brecha', 'filtrado', 'expuesto', 'fui'];
    const defenderKW = ['playbook', 'remediación', 'respuesta', 'mitigación', 'ataque', 'soc', 'cirt', 'credencial', 'institución'];
    const journalistKW = ['periodista', 'investigación', 'publicar', 'reporte', 'medios', 'fuente', 'datos'];

    let agent = 'unknown';
    const scores: Record<string, number> = { citizen: 0, defender: 0, journalist: 0 };
    for (const kw of citizenKW) if (lower.includes(kw)) scores.citizen++;
    for (const kw of defenderKW) if (lower.includes(kw)) scores.defender++;
    for (const kw of journalistKW) if (lower.includes(kw)) scores.journalist++;

    const max = Math.max(...Object.values(scores));
    if (max > 0) agent = Object.entries(scores).find(([, v]) => v === max)?.[0] ?? 'unknown';
    if (agent === 'unknown') return { agent, confidence: 0.3, reasoning_brief: 'Fallback keyword' };

    return { agent, confidence: 0.7, reasoning_brief: `Fallback heurístico (keyword match: ${agent})` };
  }

  try {
    const model = getMinimaxModel();
    const { object } = await generateObject({
      model,
      system: ROUTER_SYSTEM_PROMPT,
      prompt: userPrompt,
      schema: RouterOutputSchema,
    });
    return { agent: object.agent, confidence: object.confidence, reasoning_brief: object.reasoning_brief };
  } catch (err) {
    console.error('[router] MiniMax failed, fallback:', err);
    return { agent: 'unknown', confidence: 0, reasoning_brief: 'MiniMax fallback' };
  }
}