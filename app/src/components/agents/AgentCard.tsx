import { m } from 'motion/react';
import { Bot, Pause, Play } from 'lucide-react';
import { Badge, type BadgeProps } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatRelativeTime } from '@/lib/format';
import type { AgentInfo } from '@/types';

function toneFor(status: AgentInfo['status']): BadgeProps['tone'] {
  if (status === 'running') return 'success';
  if (status === 'paused') return 'warning';
  if (status === 'error') return 'danger';
  return 'neutral';
}

export function AgentCard({
  agent,
  onToggle,
  delay = 0,
}: {
  agent: AgentInfo;
  onToggle: (a: AgentInfo) => void;
  delay?: number;
}) {
  const running = agent.status === 'running';
  return (
    <m.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/12 text-accent">
            <Bot className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-medium text-text">{agent.name}</h3>
              <Badge tone={toneFor(agent.status)}>{agent.status}</Badge>
            </div>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted">{agent.description}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <span className="truncate">
            {agent.type}
            {agent.tasksCompleted != null && ` · ${agent.tasksCompleted} runs`}
          </span>
          <span className="shrink-0">{formatRelativeTime(agent.lastActive)}</span>
        </div>
        <Button
          variant={running ? 'subtle' : 'outline'}
          size="sm"
          className="mt-3 w-full"
          onClick={() => onToggle(agent)}
        >
          {running ? (
            <>
              <Pause className="h-3.5 w-3.5" /> Pause
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" /> Resume
            </>
          )}
        </Button>
      </Card>
    </m.div>
  );
}
