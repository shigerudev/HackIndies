import { z } from 'zod';

export const RouterOutputSchema = z.object({
  agent: z.enum(['citizen', 'defender', 'journalist', 'unknown']),
  confidence: z.number().min(0).max(1),
  reasoning_brief: z.string(),
  suggested_response_style: z.enum(['empathetic', 'technical', 'investigative', 'generic']).optional(),
});

export type RouterOutput = z.infer<typeof RouterOutputSchema>;

export const RouterInputSchema = z.object({
  message: z.string().min(1),
  conversation_history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
});

export type RouterInput = z.infer<typeof RouterInputSchema>;