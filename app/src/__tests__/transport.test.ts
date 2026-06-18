import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the live API layer so we can assert demo/fallback routing without a backend.
const { fetchModels } = vi.hoisted(() => ({ fetchModels: vi.fn() }));
vi.mock('@/lib/api', () => ({
  fetchModels,
  fetchServerInfo: vi.fn(),
  fetchSavings: vi.fn(),
  fetchEnergy: vi.fn(),
  fetchStats: vi.fn(),
  fetchAgents: vi.fn(),
}));

import { getModels, isDemo } from '@/lib/transport';
import { mockModels } from '@/lib/mock';
import { useSettings } from '@/store/settings';

beforeEach(() => {
  fetchModels.mockReset();
  useSettings.setState({ demoMode: 'auto', backendOnline: true, apiUrl: '' });
});

describe('isDemo', () => {
  it('is live when the backend is online and demoMode is auto', () => {
    useSettings.setState({ demoMode: 'auto', backendOnline: true });
    expect(isDemo()).toBe(false);
  });

  it('is demo when the backend is offline (auto)', () => {
    useSettings.setState({ demoMode: 'auto', backendOnline: false });
    expect(isDemo()).toBe(true);
  });

  it('honours an explicit on/off override regardless of backend state', () => {
    useSettings.setState({ demoMode: 'on', backendOnline: true });
    expect(isDemo()).toBe(true);
    useSettings.setState({ demoMode: 'off', backendOnline: false });
    expect(isDemo()).toBe(false);
  });
});

describe('getModels (withFallback)', () => {
  it('returns live data when the backend call succeeds', async () => {
    fetchModels.mockResolvedValue([{ id: 'live-model' }]);
    useSettings.setState({ demoMode: 'auto', backendOnline: true });
    await expect(getModels()).resolves.toEqual([{ id: 'live-model' }]);
    expect(fetchModels).toHaveBeenCalledTimes(1);
  });

  it('falls back to mock data when the live call throws', async () => {
    fetchModels.mockRejectedValue(new Error('boom'));
    useSettings.setState({ demoMode: 'auto', backendOnline: true });
    await expect(getModels()).resolves.toBe(mockModels);
    expect(fetchModels).toHaveBeenCalledTimes(1);
  });

  it('serves mock data without touching the backend in demo mode', async () => {
    useSettings.setState({ demoMode: 'on', backendOnline: true });
    await expect(getModels()).resolves.toBe(mockModels);
    expect(fetchModels).not.toHaveBeenCalled();
  });
});
