import { useCallback, useRef, useState } from 'react';
import { chatStream } from '@/lib/transport';
import { uid } from '@/lib/id';
import { useChat } from '@/store/chat';
import { useSettings } from '@/store/settings';
import type { ChatMessage, Message, ToolCall } from '@/types';

// How often buffered tokens are flushed to the store while streaming. Coalescing
// deltas keeps re-renders (and markdown re-parses) to ~20/s instead of one per
// token, which is the dominant cost on long responses.
const FLUSH_INTERVAL_MS = 50;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeParse(s: string): any {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function toolsOf(convId: string, msgId: string): ToolCall[] {
  const conv = useChat.getState().conversations.find((c) => c.id === convId);
  return conv?.messages.find((m) => m.id === msgId)?.toolCalls ?? [];
}

export function useStreamChat() {
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bufferRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback((convId: string, msgId: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (bufferRef.current) {
      const chunk = bufferRef.current;
      bufferRef.current = '';
      useChat.getState().appendContent(convId, msgId, chunk);
    }
  }, []);

  const schedule = useCallback((convId: string, msgId: string) => {
    if (timerRef.current) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (bufferRef.current) {
        const chunk = bufferRef.current;
        bufferRef.current = '';
        useChat.getState().appendContent(convId, msgId, chunk);
      }
    }, FLUSH_INTERVAL_MS);
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const send = useCallback(
    async (convId: string, text: string) => {
      const content = text.trim();
      if (!content || abortRef.current) return;

      const { addMessage, patchMessage } = useChat.getState();
      const model = useSettings.getState().model || 'qwen2.5:7b';

      // Snapshot history before appending the new turn.
      const conv = useChat.getState().conversations.find((c) => c.id === convId);
      const history: ChatMessage[] = (conv?.messages ?? [])
        .filter((m) => !m.error && m.content)
        .map((m) => ({ role: m.role, content: m.content }));

      addMessage(convId, { id: uid('msg'), role: 'user', content, createdAt: Date.now() });

      const assistantId = uid('msg');
      const assistant: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
        streaming: true,
        toolCalls: [],
      };
      addMessage(convId, assistant);

      const controller = new AbortController();
      abortRef.current = controller;
      bufferRef.current = '';
      setStreaming(true);

      const messages: ChatMessage[] = [...history, { role: 'user', content }];
      let errorMsg: string | undefined;

      try {
        for await (const evt of chatStream({ model, messages }, controller.signal)) {
          if (evt.event === 'tool_call_start') {
            flush(convId, assistantId); // keep ordering: text before the next card
            const d = safeParse(evt.data) ?? {};
            const tc: ToolCall = {
              id: uid('tc'),
              tool: d.tool ?? 'tool',
              arguments: d.arguments,
              status: 'running',
            };
            patchMessage(convId, assistantId, { toolCalls: [...toolsOf(convId, assistantId), tc] });
            continue;
          }
          if (evt.event === 'tool_call_end') {
            const d = safeParse(evt.data) ?? {};
            const cur = toolsOf(convId, assistantId);
            const revIdx = [...cur].reverse().findIndex((t) => t.status === 'running' && (!d.tool || t.tool === d.tool));
            if (revIdx >= 0) {
              const idx = cur.length - 1 - revIdx;
              const next = cur.slice();
              next[idx] = {
                ...next[idx],
                status: d.success === false ? 'error' : 'success',
                latencyMs: typeof d.latency === 'number' ? d.latency : undefined,
                result: d.result,
              };
              patchMessage(convId, assistantId, { toolCalls: next });
            }
            continue;
          }
          if (evt.event && !evt.event.startsWith('tool_call')) {
            continue; // other named events ignored for now
          }

          const json = safeParse(evt.data);
          if (!json) continue;
          const choice = json.choices?.[0];
          const delta: unknown = choice?.delta?.content;
          if (typeof delta === 'string' && delta) {
            bufferRef.current += delta;
            schedule(convId, assistantId);
          }
          if (json.usage) patchMessage(convId, assistantId, { usage: json.usage });
          if (choice?.finish_reason && choice.finish_reason !== null) break;
        }
      } catch (err) {
        const e = err as Error;
        if (e?.name !== 'AbortError') errorMsg = e?.message || 'Request failed';
      } finally {
        flush(convId, assistantId);
        patchMessage(convId, assistantId, { streaming: false, error: errorMsg });
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [flush, schedule],
  );

  return { send, stop, streaming };
}
