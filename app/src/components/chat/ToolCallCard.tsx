import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Loader2, Wrench, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ToolCall } from '@/types';

function StatusIcon({ status }: { status: ToolCall['status'] }) {
  if (status === 'running') return <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />;
  if (status === 'error') return <X className="h-3.5 w-3.5 text-danger" />;
  return <Check className="h-3.5 w-3.5 text-success" />;
}

function pretty(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function ToolCallCard({ tool }: { tool: ToolCall }) {
  const [open, setOpen] = useState(false);
  const hasDetail = tool.arguments != null || tool.result != null;

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-border bg-surface-2/50">
      <button
        onClick={() => hasDetail && setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center gap-2 px-3 py-2 text-xs',
          hasDetail && 'cursor-pointer hover:bg-surface-2',
        )}
      >
        <Wrench className="h-3.5 w-3.5 text-muted" />
        <span className="font-mono font-medium text-text">{tool.tool}</span>
        <StatusIcon status={tool.status} />
        {typeof tool.latencyMs === 'number' && (
          <span className="ml-auto font-mono text-[10px] text-muted">{tool.latencyMs}ms</span>
        )}
        {hasDetail && (
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-muted transition-transform',
              tool.latencyMs == null && 'ml-auto',
              open && 'rotate-180',
            )}
          />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && hasDetail && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border"
          >
            <div className="space-y-2 px-3 py-2 text-xs">
              {tool.arguments != null && (
                <div>
                  <div className="mb-1 font-medium text-muted">Arguments</div>
                  <pre className="scrollbar-thin overflow-x-auto rounded-md bg-surface p-2 font-mono text-[11px] text-text">
                    {pretty(tool.arguments)}
                  </pre>
                </div>
              )}
              {tool.result != null && (
                <div>
                  <div className="mb-1 font-medium text-muted">Result</div>
                  <pre className="scrollbar-thin overflow-x-auto rounded-md bg-surface p-2 font-mono text-[11px] text-text">
                    {pretty(tool.result)}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
