import { generateObject } from 'ai';
import { z } from 'zod';
import { hasMiniMax, env } from '../../lib/env.js';
import { DefenderInputSchema, DefenderOutputSchema } from './schema.js';
import { DEFENDER_SYSTEM_PROMPT, DEFENDER_USER_PROMPT_TEMPLATE } from './prompt.js';
import { searchPlaybooks } from '../../lib/playbook-rag.js';
import { getMinimaxModel } from '../../lib/minimax.js';

function buildContext(ctx: { institution_slug?: string; event_id?: string; severity?: string }): string {
  const parts: string[] = [];
  if (ctx.institution_slug) parts.push(`Institución: ${ctx.institution_slug}`);
  if (ctx.event_id) parts.push(`Event ID: ${ctx.event_id}`);
  if (ctx.severity) parts.push(`Severidad: ${ctx.severity}`);
  return parts.length ? parts.join(', ') : 'Sin contexto adicional.';
}

export async function getDefenderBriefing(
  message: string,
  context?: { institution_slug?: string; event_id?: string; severity?: string },
): Promise<{
  playbook_slug: string | null;
  playbook_title: string | null;
  summary: string;
  steps: { order: number; action: string; rationale: string }[];
  effort_hours_estimate: number | null;
  cost_estimate_usd: number | null;
  confidence: number;
}> {
  const parsed = DefenderInputSchema.safeParse({ message, context });
  if (!parsed.success) {
    return {
      playbook_slug: null, playbook_title: null, summary: 'Input inválido',
      steps: [], effort_hours_estimate: null, cost_estimate_usd: null, confidence: 0,
    };
  }

  const userPrompt = DEFENDER_USER_PROMPT_TEMPLATE
    .replace('{message}', message)
    .replace('{context}', buildContext(context ?? {}));

  // Tool: semantic search over playbooks to feed context
  let playbookContext = '';
  try {
    const results = await searchPlaybooks(message, 2);
    if (results.length) {
      playbookContext = '\n\nPlaybooks relevantes encontrados:\n' +
        results.map((p) => `- ${p.title_es}: ${p.body_md.substring(0, 200)}...`).join('\n');
    }
  } catch {
    // Non-fatal — continue without playbook context
  }

  if (!hasMiniMax()) {
    // Mock fallback: return a generic high-severity playbook
    return {
      playbook_slug: 'credencial-leak-response',
      playbook_title: 'Respuesta ante fuga de credenciales',
      summary: 'Se detectó una posible exposición de credenciales en la institución. Seguí los pasos de contención y remediación.',
      steps: [
        { order: 1, action: 'Rotar contraseñas de cuentas administrativas', rationale: 'Prevenir expansión del compromiso' },
        { order: 2, action: 'Revisar logs de autenticación por actividad anómala', rationale: 'Detectar movimiento lateral' },
        { order: 3, action: 'Notificar al CIRT institucional', rationale: 'Activación del protocolo de respuesta' },
      ],
      effort_hours_estimate: 8,
      cost_estimate_usd: 500,
      confidence: 0.4,
    };
  }

  try {
    const model = getMinimaxModel();
    const { object } = await generateObject({
      model,
      system: DEFENDER_SYSTEM_PROMPT + (playbookContext ? `\n\n${playbookContext}` : ''),
      prompt: userPrompt,
      schema: DefenderOutputSchema,
    });
    return {
      playbook_slug: object.playbook_slug ?? null,
      playbook_title: object.playbook_title ?? null,
      summary: object.summary,
      steps: object.steps.map((s) => ({ order: s.order, action: s.action, rationale: s.rationale })),
      effort_hours_estimate: object.effort_hours_estimate ?? null,
      cost_estimate_usd: object.cost_estimate_usd ?? null,
      confidence: object.confidence,
    };
  } catch (err) {
    console.error('[defender] MiniMax failed:', err);
    return {
      playbook_slug: null, playbook_title: null, summary: 'Error al generar briefing. Intentar de nuevo.',
      steps: [], effort_hours_estimate: null, cost_estimate_usd: null, confidence: 0,
    };
  }
}