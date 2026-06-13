import { useNavigate } from 'react-router';
import { Tooltip } from '@/components/ui/Tooltip';
import { isDemo } from '@/lib/transport';
import { useSettings } from '@/store/settings';
import { cn } from '@/lib/cn';

export function ConnectionBadge() {
  const navigate = useNavigate();
  // subscribe so the badge re-renders when status changes
  const online = useSettings((s) => s.backendOnline);
  useSettings((s) => s.demoMode);
  const demo = isDemo();

  const label = demo ? 'Demo mode' : online ? 'Connected' : 'Connecting…';
  const tone = demo ? 'warning' : online ? 'success' : 'muted';

  return (
    <Tooltip
      content={
        demo
          ? 'No backend detected — showing simulated data. Click to configure.'
          : online
            ? 'Connected to jarvis serve'
            : 'Looking for a backend on :8000…'
      }
    >
      <button
        onClick={() => navigate('/settings')}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-2"
      >
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            tone === 'success' && 'bg-success',
            tone === 'warning' && 'bg-warning',
            tone === 'muted' && 'animate-pulse bg-muted',
          )}
        />
        {label}
      </button>
    </Tooltip>
  );
}
