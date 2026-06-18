import { useEffect, useRef } from 'react';
import { fireAppOpened } from '@/lib/analytics';
import { useSettings } from '@/store/settings';

/**
 * Fire the `app_opened` analytics event once, after the backend is first
 * detected as online (so `/v1/analytics/identity` is actually reachable).
 * In demo mode the probe never succeeds, so nothing is sent.
 */
export function useAppOpened(): void {
  const online = useSettings((s) => s.backendOnline);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || online !== true) return;
    fired.current = true;
    void fireAppOpened();
  }, [online]);
}
