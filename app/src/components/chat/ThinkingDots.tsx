import { m } from 'motion/react';

export function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 py-1.5" aria-label="Assistant is thinking">
      {[0, 1, 2].map((i) => (
        <m.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-muted"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
