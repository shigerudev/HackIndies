import { generateText, streamText } from 'ai';
import { CITIZEN_SYSTEM_PROMPT } from '../agents/citizen/prompt.js';
import { hasMiniMax } from './env.js';
import { getMinimaxModel } from './minimax.js';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export function mockCitizenReply(query: string): string {
  return `Soy el asistente ciudadano de NOMAD Centinela (modo demo). Recibí tu consulta sobre: "${query.slice(0, 120)}". 

Recomendaciones generales:
• Rotá contraseñas si tu correo apareció en una brecha pública.
• Activá 2FA en banca, correo y redes sociales.
• No compartas códigos OTP con nadie.

Para verificar exposición usá POST /api/citizen/check con el prefijo SHA-1 de 5 caracteres de tu email. Prefijos de prueba: a1b2c, d4e5f, f6a7b.`;
}

export async function generateCitizenReply(messages: ChatMessage[]): Promise<{ content: string; mock: boolean }> {
  if (!hasMiniMax()) {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    return { content: mockCitizenReply(lastUser?.content ?? ''), mock: true };
  }

  const { text } = await generateText({
    model: getMinimaxModel(),
    system: CITIZEN_SYSTEM_PROMPT,
    messages,
    maxOutputTokens: 1024,
    temperature: 0.7,
  });

  return { content: text, mock: false };
}

export function streamCitizenReply(messages: ChatMessage[]): ReturnType<typeof streamText> {
  if (!hasMiniMax()) {
    throw new Error('MiniMax not configured');
  }
  return streamText({
    model: getMinimaxModel(),
    system: CITIZEN_SYSTEM_PROMPT,
    messages,
    maxOutputTokens: 1024,
    temperature: 0.7,
  });
}
