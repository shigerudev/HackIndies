import { z } from 'zod';

export const InvestigatorOutputSchema = z.object({
  label: z.enum(['confirmed', 'strong_evidence', 'claimed']),
  confidence: z.number().min(0).max(1),
  sources_summary: z.array(
    z.object({
      source_type: z.string(),
      note: z.string(),
    }),
  ),
  recommendation: z.enum(['approve_for_review', 'needs_more_info', 'reject']),
  reasoning_brief: z.string(),
  hitl_required: z.boolean().default(true),
});

export type InvestigatorOutput = z.infer<typeof InvestigatorOutputSchema>;

export const InvestigatorInputSchema = z.object({
  event_id: z.string().uuid(),
  triage: z.record(z.unknown()).optional(),
});

export type InvestigatorInput = z.infer<typeof InvestigatorInputSchema>;
