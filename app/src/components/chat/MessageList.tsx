import { useEffect, useRef } from 'react';
import { MessageBubble } from '@/components/chat/MessageBubble';
import type { Message } from '@/types';

export function MessageList({ messages, streaming }: { messages: Message[]; streaming: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 96;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (stick.current) {
      endRef.current?.scrollIntoView({ behavior: streaming ? 'auto' : 'smooth' });
    }
  }, [messages, streaming]);

  return (
    <div ref={containerRef} className="scrollbar-thin h-full overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={endRef} className="h-px" />
      </div>
    </div>
  );
}
