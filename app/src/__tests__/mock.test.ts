import { describe, expect, it } from 'vitest';
import { mockStreamChat } from '@/lib/mock';
import type { SSEEvent } from '@/types';

describe('mockStreamChat', () => {
  it('streams a role chunk, content deltas, and a final usage chunk', async () => {
    const events: SSEEvent[] = [];
    for await (const e of mockStreamChat({ model: 'x', messages: [{ role: 'user', content: 'hello' }] })) {
      events.push(e);
    }
    expect(events.length).toBeGreaterThan(2);

    const first = JSON.parse(events[0].data);
    expect(first.choices[0].delta.role).toBe('assistant');

    const last = JSON.parse(events[events.length - 1].data);
    expect(last.choices[0].finish_reason).toBe('stop');
    expect(last.usage.completion_tokens).toBeGreaterThan(0);
  });

  it('emits tool-call events when the prompt implies a tool', async () => {
    const events: SSEEvent[] = [];
    for await (const e of mockStreamChat({
      model: 'x',
      messages: [{ role: 'user', content: 'search the news for AI' }],
    })) {
      events.push(e);
    }
    expect(events.some((e) => e.event === 'tool_call_start')).toBe(true);
    expect(events.some((e) => e.event === 'tool_call_end')).toBe(true);
  });

  it('stops promptly when aborted', async () => {
    const ctrl = new AbortController();
    const gen = mockStreamChat(
      { model: 'x', messages: [{ role: 'user', content: 'tell me a long story please' }] },
      ctrl.signal,
    );
    await gen.next(); // consume the role chunk
    ctrl.abort();

    let count = 0;
    let r = await gen.next();
    while (!r.done) {
      count += 1;
      r = await gen.next();
    }
    expect(count).toBeLessThan(20);
  });
});
