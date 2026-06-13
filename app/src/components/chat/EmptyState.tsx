import { motion } from 'motion/react';
import { Code2, Compass, Newspaper, Sparkles } from 'lucide-react';
import { JarvisMark } from '@/components/layout/JarvisMark';

const suggestions = [
  { icon: Compass, title: 'Plan my day', prompt: 'Help me plan a focused work day around my top 3 priorities.' },
  { icon: Code2, title: 'Write code', prompt: 'Write a Python function that deduplicates a list while preserving order.' },
  { icon: Newspaper, title: 'Summarize news', prompt: 'Search the news and summarize the top 3 AI stories today.' },
  { icon: Sparkles, title: 'Brainstorm', prompt: 'Give me 5 creative side-project ideas that use local LLMs.' },
];

export function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-5 w-fit"
        >
          <JarvisMark className="h-16 w-16" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="text-2xl font-semibold tracking-tight"
        >
          How can I help?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="mt-2 text-sm text-muted"
        >
          Ask anything — runs locally first, calling the cloud only when truly needed.
        </motion.p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {suggestions.map((s, i) => (
            <motion.button
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => onPick(s.prompt)}
              className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-3.5 text-left transition-colors hover:border-accent/50 hover:bg-surface-2"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/12 text-accent">
                <s.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-text">{s.title}</span>
                <span className="block truncate text-xs text-muted">{s.prompt}</span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
