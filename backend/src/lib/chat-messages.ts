import { convertToModelMessages, type UIMessage } from 'ai';
import type { ChatMessage } from './citizen-chat.js';

function modelContentToString(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter((p): p is { type: string; text?: string } => typeof p === 'object' && p !== null)
      .filter((p) => p.type === 'text' && p.text)
      .map((p) => p.text!)
      .join('');
  }
  return '';
}

export async function normalizeChatMessages(raw: unknown[]): Promise<ChatMessage[]> {
  if (!raw.length) return [];

  const first = raw[0] as Record<string, unknown>;
  if ('parts' in first || 'id' in first) {
    const modelMessages = await convertToModelMessages(raw as UIMessage[]);
    return modelMessages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: modelContentToString(m.content),
      }))
      .filter((m) => m.content.length > 0);
  }

  return raw
    .map((m) => {
      const row = m as { role?: string; content?: string };
      if (row.role !== 'user' && row.role !== 'assistant') return null;
      return { role: row.role, content: String(row.content ?? '') };
    })
    .filter((m): m is ChatMessage => m !== null && m.content.length > 0);
}
