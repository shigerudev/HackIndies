import { z } from 'zod';

export const DefenderOutputSchema = z.object({
  playbook_slug: z.string().nullable(),
  playbook_title: z.string().nullable(),
  summary: z.string(),
  steps: z.array(z.object({
    order: z.number(),
    action: z.string(),
    rationale: z.string(),
  })),
  effort_hours_estimate: z.number().nullable().optional(),
  cost_estimate_usd: z.number().nullable().optional(),
  confidence: z.number().min(0).max(1),
});

export type DefenderOutput = z.infer<typeof DefenderOutputSchema>;

export const DefenderInputSchema = z.object({
  message: z.string().min(1),
  context: z.object({
    institution_slug: z.string().optional(),
    event_id: z.string().uuid().optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  }).optional(),
});

export type DefenderInput = z.infer<typeof DefenderInputSchema>;