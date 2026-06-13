import { useNavigate } from 'react-router';
import { Info, X } from 'lucide-react';
import { useState } from 'react';
import { isDemo } from '@/lib/transport';
import { useSettings } from '@/store/settings';

export function ConnectionBanner() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  // subscribe for reactivity
  useSettings((s) => s.backendOnline);
  useSettings((s) => s.demoMode);

  if (!isDemo() || dismissed) return null;

  return (
    <div className="flex items-center gap-2 border-b border-border bg-warning/10 px-4 py-2 text-xs text-warning">
      <Info className="h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0">
        Demo mode — no backend detected. You're seeing simulated data and streamed replies. Start{' '}
        <code className="rounded bg-warning/15 px-1 font-mono">jarvis serve</code> to go live.
      </span>
      <button
        onClick={() => navigate('/settings')}
        className="ml-auto shrink-0 cursor-pointer rounded-md px-2 py-0.5 font-medium underline-offset-2 hover:underline"
      >
        Configure
      </button>
      <button
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        className="shrink-0 cursor-pointer rounded-md p-0.5 hover:bg-warning/15"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
