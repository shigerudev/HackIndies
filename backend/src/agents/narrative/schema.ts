import { z } from 'zod';

export const NarrativeOutputSchema = z.object({
  title_es: z.string(),
  body_md: z.string(),
  key_facts: z.array(
    z.object({
      fact: z.string(),
      source: z.string(),
    }),
  ),
  sources_cited: z.array(z.string()),
  draft_quality: z.enum(['ready_for_review', 'needs_facts', 'needs_clarity']),
  confidence: z.number().min(0).max(1),
});

export type NarrativeOutput = z.infer<typeof NarrativeOutputSchema>;

export const NarrativeInputSchema = z.object({
  event_id: z.string().uuid(),
});

export type NarrativeInput = z.infer<typeof NarrativeInputSchema>;