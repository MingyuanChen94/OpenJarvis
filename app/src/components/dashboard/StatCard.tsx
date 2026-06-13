import type { ComponentType } from 'react';
import { motion } from 'motion/react';
import { Card } from '@/components/ui/Card';
import { useCountUp } from '@/hooks/useCountUp';

interface StatCardProps {
  label: string;
  value: number;
  format: (n: number) => string;
  icon: ComponentType<{ className?: string }>;
  sublabel?: string;
  delay?: number;
}

export function StatCard({ label, value, format, icon: Icon, sublabel, delay = 0 }: StatCardProps) {
  const display = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted">{label}</span>
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent/12 text-accent">
            <Icon className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{format(display)}</div>
        {sublabel && <div className="mt-0.5 text-xs text-muted">{sublabel}</div>}
      </Card>
    </motion.div>
  );
}
