import * as real from '@/lib/api';
import * as mock from '@/lib/mock';
import { streamChat, type ChatRequest } from '@/lib/sse';
import { useSettings } from '@/store/settings';
import type {
  AgentInfo,
  EnergyStats,
  ModelInfo,
  SavingsData,
  ServerInfo,
  SSEEvent,
  TelemetryStats,
} from '@/types';

/**
 * Whether the app should serve mock data instead of hitting the backend.
 * `auto` decides based on the last /health probe; `on`/`off` force it; the
 * VITE_FORCE_MOCK env var overrides everything (handy for offline UI work).
 */
export function isDemo(): boolean {
  const env = import.meta.env.VITE_FORCE_MOCK;
  if (env === '1' || env === 'true') return true;
  const s = useSettings.getState();
  if (s.demoMode === 'on') return true;
  if (s.demoMode === 'off') return false;
  return s.backendOnline === false;
}

/** Try the live backend, falling back to mock data on any error. */
async function withFallback<T>(live: () => Promise<T>, fallback: () => T): Promise<T> {
  if (isDemo()) return fallback();
  try {
    return await live();
  } catch {
    return fallback();
  }
}

export async function* chatStream(
  req: ChatRequest,
  signal?: AbortSignal,
): AsyncGenerator<SSEEvent> {
  if (isDemo()) {
    yield* mock.mockStreamChat(req, signal);
    return;
  }
  yield* streamChat(req, signal);
}

export function getModels(): Promise<ModelInfo[]> {
  return withFallback(real.fetchModels, () => mock.mockModels);
}

export function getServerInfo(): Promise<ServerInfo> {
  return withFallback(real.fetchServerInfo, () => mock.mockServerInfo);
}

export function getSavings(): Promise<SavingsData> {
  return withFallback(real.fetchSavings, () => mock.mockSavings);
}

export function getEnergy(): Promise<EnergyStats> {
  return withFallback(real.fetchEnergy, () => mock.driftEnergy(mock.mockEnergy));
}

export function getStats(): Promise<TelemetryStats> {
  return withFallback(real.fetchStats, () => mock.mockStats);
}

export function getAgents(): Promise<AgentInfo[]> {
  return withFallback(real.fetchAgents, () => mock.mockAgents);
}
