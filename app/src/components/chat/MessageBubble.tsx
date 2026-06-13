import { memo } from 'react';
import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { Markdown } from '@/components/chat/Markdown';
import { ToolCallCard } from '@/components/chat/ToolCallCard';
import { ThinkingDots } from '@/components/chat/ThinkingDots';
import { JarvisMark } from '@/components/layout/JarvisMark';
import { cn } from '@/lib/cn';
import type { Message } from '@/types';

export const MessageBubble = memo(function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const showThinking = message.streaming && !message.content && (message.toolCalls?.length ?? 0) === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && <JarvisMark className="mt-0.5 h-7 w-7 shrink-0" />}

      <div className={cn('min-w-0', isUser ? 'max-w-[85%]' : 'flex-1')}>
        {isUser ? (
          <div className="whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-[0.925rem] text-accent-fg shadow-sm">
            {message.content}
          </div>
        ) : (
          <div>
            {message.toolCalls?.map((tc) => <ToolCallCard key={tc.id} tool={tc} />)}
            {showThinking && <ThinkingDots />}
            {message.content && (
              <div className={cn(message.streaming && 'streaming-caret')}>
                <Markdown content={message.content} />
              </div>
            )}
            {message.error && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{message.error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});
