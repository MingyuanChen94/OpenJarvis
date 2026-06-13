import { useSettings } from '@/store/settings';
import type {
  AgentInfo,
  EnergyStats,
  ModelInfo,
  SavingsData,
  ServerInfo,
  TelemetryStats,
} from '@/types';

/**
 * Resolve the backend base URL.
 * Empty string = same-origin requests, which the Vite dev proxy forwards to
 * `jarvis serve` (and which work directly when the app is hosted by the server).
 */
export function getBase(): string {
  const { apiUrl } = useSettings.getState();
  if (apiUrl) return apiUrl.replace(/\/+$/, '');
  const env = import.meta.env.VITE_API_URL as string | undefined;
  if (env) return env.replace(/\/+$/, '');
  return '';
}

export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const key =
    useSettings.getState().apiKey ||
    (import.meta.env.VITE_OPENJARVIS_API_KEY as string | undefined) ||
    '';
  return key ? { ...extra, Authorization: `Bearer ${key}` } : { ...extra };
}

export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${getBase()}${path}`, {
    ...init,
    headers: authHeaders(init.headers as Record<string, string> | undefined),
  });
}

async function getJson<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return (await res.json()) as T;
}

/** Liveness probe used to auto-detect demo mode. Short timeout, never throws. */
export async function probeHealth(timeoutMs = 1500): Promise<boolean> {
  try {
    const res = await fetch(`${getBase()}/health`, {
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchModels(): Promise<ModelInfo[]> {
  const j = await getJson<{ data?: ModelInfo[] } | ModelInfo[]>('/v1/models');
  return Array.isArray(j) ? j : (j.data ?? []);
}

export function fetchServerInfo(): Promise<ServerInfo> {
  return getJson<ServerInfo>('/v1/info');
}

export function fetchSavings(): Promise<SavingsData> {
  return getJson<SavingsData>('/v1/savings');
}

export function fetchEnergy(): Promise<EnergyStats> {
  return getJson<EnergyStats>('/v1/telemetry/energy');
}

export function fetchStats(): Promise<TelemetryStats> {
  return getJson<TelemetryStats>('/v1/telemetry/stats');
}

export async function fetchAgents(): Promise<AgentInfo[]> {
  const j = await getJson<{ agents?: AgentInfo[] } | AgentInfo[]>('/v1/managed-agents');
  return Array.isArray(j) ? j : (j.agents ?? []);
}
