import { z } from 'zod';

export const TriageOutputSchema = z.object({
  institution_slug: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  suggested_title: z.string(),
  suggested_summary: z.string(),
  malware_family: z.string().nullable().optional(),
  credentials_count_estimate: z.number().int().min(0).default(0),
  confidence: z.number().min(0).max(1),
  reasoning_brief: z.string(),
});

export type TriageOutput = z.infer<typeof TriageOutputSchema>;

export const TriageInputSchema = z.object({
  event_id: z.string().uuid().optional(),
  signal: z
    .object({
      title: z.string().min(1),
      summary: z.string().optional(),
      institution_slug: z.string().optional(),
      source_type: z.enum(['osint_feed', 'hibp', 'public_report', 'make_webhook']).optional(),
    })
    .optional(),
});

export type TriageInput = z.infer<typeof TriageInputSchema>;
