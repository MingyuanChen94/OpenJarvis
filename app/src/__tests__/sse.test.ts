import { describe, expect, it } from 'vitest';
import { parseSSEBlock, streamChat } from '@/lib/sse';
import type { SSEEvent } from '@/types';

function streamFrom(chunks: string[]): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  let i = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (i < chunks.length) controller.enqueue(enc.encode(chunks[i++]));
      else controller.close();
    },
  });
}

describe('parseSSEBlock', () => {
  it('parses a bare data line', () => {
    expect(parseSSEBlock('data: {"a":1}')).toEqual({ event: undefined, data: '{"a":1}' });
  });
  it('parses event + data', () => {
    expect(parseSSEBlock('event: tool_call_start\ndata: {"tool":"web"}')).toEqual({
      event: 'tool_call_start',
      data: '{"tool":"web"}',
    });
  });
  it('joins multi-line data', () => {
    expect(parseSSEBlock('data: a\ndata: b')).toEqual({ event: undefined, data: 'a\nb' });
  });
  it('ignores comments and empty blocks', () => {
    expect(parseSSEBlock(': heartbeat')).toBeNull();
    expect(parseSSEBlock('')).toBeNull();
  });
});

describe('streamChat', () => {
  it('yields events across chunk boundaries and stops at [DONE]', async () => {
    const body = streamFrom([
      'data: {"choices":[{"delta":{"role":"assistant"}}]}\n\n',
      'event: tool_call_start\ndata: {"tool":"web"}\n\n',
      'data: {"choices":[{"delta":{"content":"Hi"}}]}\n\ndata: [DONE]\n\n',
      'data: {"choices":[{"delta":{"content":"ignored"}}]}\n\n',
    ]);
    const original = globalThis.fetch;
    globalThis.fetch = (async () => new Response(body, { status: 200 })) as typeof fetch;

    try {
      const events: SSEEvent[] = [];
      for await (const e of streamChat({ model: 'x', messages: [{ role: 'user', content: 'hi' }] })) {
        events.push(e);
      }
      expect(events).toHaveLength(3);
      expect(events[1].event).toBe('tool_call_start');
      const last = JSON.parse(events[2].data);
      expect(last.choices[0].delta.content).toBe('Hi');
    } finally {
      globalThis.fetch = original;
    }
  });

  it('throws on a non-ok response', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (async () => new Response('nope', { status: 500 })) as typeof fetch;
    try {
      const run = async () => {
        for await (const _e of streamChat({ model: 'x', messages: [] })) void _e;
      };
      await expect(run()).rejects.toThrow();
    } finally {
      globalThis.fetch = original;
    }
  });
});
