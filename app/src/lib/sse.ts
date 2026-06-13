import { authHeaders, getBase } from '@/lib/api';
import type { ChatMessage, SSEEvent } from '@/types';

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

/**
 * Parse a single SSE block ("event:"/"data:" lines separated by newlines).
 * Returns null for empty/comment-only blocks. Exported for unit testing.
 */
export function parseSSEBlock(block: string): SSEEvent | null {
  const lines = block.split('\n');
  let event: string | undefined;
  const dataLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).replace(/^ /, ''));
    }
    // lines starting with ":" are comments/heartbeats — ignored
  }
  if (dataLines.length === 0 && event === undefined) return null;
  return { event, data: dataLines.join('\n') };
}

/**
 * Stream `POST /v1/chat/completions` as Server-Sent Events.
 * Yields each parsed block; the OpenAI-style `data: [DONE]` terminator ends the
 * stream. The backend also emits named events (tool_call_start/end, etc.).
 */
export async function* streamChat(
  req: ChatRequest,
  signal?: AbortSignal,
): AsyncGenerator<SSEEvent> {
  const res = await fetch(`${getBase()}/v1/chat/completions`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ ...req, stream: true }),
    signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`Chat request failed (${res.status}) ${text || res.statusText}`.trim());
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const blocks = buffer.split('\n\n');
      buffer = blocks.pop() ?? '';
      for (const block of blocks) {
        const evt = parseSSEBlock(block);
        if (!evt) continue;
        if (evt.data === '[DONE]') return;
        yield evt;
      }
    }
    const tail = parseSSEBlock(buffer);
    if (tail && tail.data !== '[DONE]') yield tail;
  } finally {
    reader.releaseLock();
  }
}
