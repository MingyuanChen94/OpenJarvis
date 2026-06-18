import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

const { apiFetch } = vi.hoisted(() => ({ apiFetch: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiFetch }));

function identityResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('fireAppOpened', () => {
  beforeEach(() => {
    // Reset the module so its one-shot `sent` guard starts fresh each test.
    vi.resetModules();
    apiFetch.mockReset();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('{}', { status: 200 }))),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('no-ops when analytics is disabled in config', async () => {
    apiFetch.mockResolvedValue(
      identityResponse({ enabled: false, anon_id: '', host: '', key: '' }),
    );
    const { fireAppOpened } = await import('@/lib/analytics');
    await fireAppOpened();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('no-ops when the identity endpoint is unreachable', async () => {
    apiFetch.mockResolvedValue(new Response('nope', { status: 502 }));
    const { fireAppOpened } = await import('@/lib/analytics');
    await fireAppOpened();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('posts an app_opened event to PostHog when enabled', async () => {
    apiFetch.mockResolvedValue(
      identityResponse({
        enabled: true,
        anon_id: 'anon-123',
        host: 'https://ph.example.com/',
        key: 'phc_public',
      }),
    );
    const { fireAppOpened } = await import('@/lib/analytics');
    await fireAppOpened();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (globalThis.fetch as Mock).mock.calls[0];
    expect(url).toBe('https://ph.example.com/capture/');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toMatchObject({
      event: 'app_opened',
      distinct_id: 'anon-123',
      api_key: 'phc_public',
    });
  });
});
