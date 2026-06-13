import { useEffect } from 'react';
import { probeHealth } from '@/lib/api';
import { isDemo } from '@/lib/transport';
import { useSettings } from '@/store/settings';

export interface BackendStatus {
  online: boolean;
  demo: boolean;
}

/** Periodically probe /health and expose live-vs-demo status. */
export function useBackendStatus(intervalMs = 20000): BackendStatus {
  const setBackendOnline = useSettings((s) => s.setBackendOnline);
  const backendOnline = useSettings((s) => s.backendOnline);
  // re-read these so isDemo() recomputes on change
  useSettings((s) => s.demoMode);

  useEffect(() => {
    let active = true;
    const check = async () => {
      const ok = await probeHealth();
      if (active) setBackendOnline(ok);
    };
    void check();
    const t = setInterval(check, intervalMs);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [setBackendOnline, intervalMs]);

  return { online: backendOnline === true, demo: isDemo() };
}
