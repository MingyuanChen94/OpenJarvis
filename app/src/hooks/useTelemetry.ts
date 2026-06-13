import { useEffect, useState } from 'react';
import { getEnergy, getSavings, getStats } from '@/lib/transport';
import { useSettings } from '@/store/settings';
import type { EnergyStats, SavingsData, TelemetryStats } from '@/types';

export function useTelemetry(pollMs = 5000) {
  const [savings, setSavings] = useState<SavingsData | null>(null);
  const [energy, setEnergy] = useState<EnergyStats | null>(null);
  const [stats, setStats] = useState<TelemetryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const backendOnline = useSettings((s) => s.backendOnline);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const [sv, en, st] = await Promise.all([getSavings(), getEnergy(), getStats()]);
        if (!active) return;
        setSavings(sv);
        setEnergy(en);
        setStats(st);
      } finally {
        if (active) setLoading(false);
      }
    };
    void refresh();
    const t = setInterval(refresh, pollMs);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [backendOnline, pollMs]);

  return { savings, energy, stats, loading };
}
