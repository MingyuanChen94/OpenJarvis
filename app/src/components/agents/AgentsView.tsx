import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AgentCard } from '@/components/agents/AgentCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { getAgents } from '@/lib/transport';
import { useSettings } from '@/store/settings';
import type { AgentInfo } from '@/types';

export function AgentsView() {
  const [agents, setAgents] = useState<AgentInfo[] | null>(null);
  const backendOnline = useSettings((s) => s.backendOnline);

  useEffect(() => {
    let active = true;
    void getAgents().then((a) => {
      if (active) setAgents(a);
    });
    return () => {
      active = false;
    };
  }, [backendOnline]);

  const toggle = (a: AgentInfo) => {
    setAgents(
      (list) =>
        list?.map((x) =>
          x.id === a.id ? { ...x, status: x.status === 'running' ? 'paused' : 'running' } : x,
        ) ?? list,
    );
    toast(`${a.status === 'running' ? 'Paused' : 'Resumed'} ${a.name}`);
  };

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-5 py-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold tracking-tight">Agents</h2>
          <p className="text-sm text-muted">
            Background workers that run on a schedule or react to events.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {!agents &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          {agents?.map((a, i) => <AgentCard key={a.id} agent={a} onToggle={toggle} delay={i * 0.05} />)}
          {agents && agents.length === 0 && (
            <p className="text-sm text-muted">No agents configured yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
