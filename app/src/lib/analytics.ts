import { apiFetch } from '@/lib/api';

interface AnalyticsIdentity {
  enabled: boolean;
  anon_id: string;
  host: string;
  key: string;
}

let sent = false;

/**
 * Report a one-shot `app_opened` event, the same event the old desktop/web
 * frontend owned (the backend deliberately does not fire it — see
 * `server/app.py`). DAU/WAU/MAU is derived from it.
 *
 * Flow: ask the backend for the anonymous analytics identity
 * (`/v1/analytics/identity`). If analytics is disabled in config, the backend
 * is unreachable, or anything errors, this is a silent no-op — telemetry is
 * strictly best-effort and never disrupts the app. When enabled, the event is
 * posted straight to the configured PostHog project (a public, opt-in key),
 * matching what `posthog-js` would have sent.
 */
export async function fireAppOpened(): Promise<void> {
  if (sent) return;
  try {
    const res = await apiFetch('/v1/analytics/identity');
    if (!res.ok) return;
    const id = (await res.json()) as AnalyticsIdentity;
    if (!id.enabled || !id.key || !id.host) return;

    const host = id.host.replace(/\/+$/, '');
    await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        api_key: id.key,
        event: 'app_opened',
        distinct_id: id.anon_id,
        properties: { source: 'web_app', $lib: 'openjarvis-app' },
      }),
    });
    sent = true;
  } catch {
    // Best-effort telemetry — swallow everything.
  }
}
