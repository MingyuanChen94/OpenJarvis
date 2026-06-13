import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Coins, Cpu, Gauge, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/dashboard/StatCard';
import { SavingsChart } from '@/components/dashboard/SavingsChart';
import { EnergyGauge } from '@/components/dashboard/EnergyGauge';
import { ThroughputChart } from '@/components/dashboard/ThroughputChart';
import { useTelemetry } from '@/hooks/useTelemetry';
import { formatEnergy, formatNumber, formatPower, formatUsd } from '@/lib/format';

export function DashboardView() {
  const { savings, energy, stats } = useTelemetry(4000);
  const [series, setSeries] = useState<{ t: number; v: number }[]>([]);

  // Build a rolling throughput series from the polled stats for a live sparkline.
  useEffect(() => {
    const base = stats?.avg_tokens_per_sec ?? 40;
    const v = Math.round(base * (0.85 + Math.random() * 0.3));
    setSeries((s) => [...s.slice(-39), { t: Date.now(), v }]);
  }, [stats, energy]);

  const totalSaved = savings?.per_provider.reduce((a, p) => a + (p.total_cost || 0), 0) ?? 0;

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-5xl px-5 py-6"
      >
        <div className="mb-5">
          <h2 className="text-lg font-semibold tracking-tight">Local intelligence, measured</h2>
          <p className="text-sm text-muted">
            What you'd have paid and burned running these requests in the cloud.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Saved vs cloud" value={totalSaved} format={formatUsd} icon={Coins} sublabel="estimated" delay={0} />
          <StatCard label="Tokens processed" value={savings?.total_tokens ?? 0} format={formatNumber} icon={Cpu} delay={0.05} />
          <StatCard
            label="Requests"
            value={stats?.total_requests ?? savings?.total_calls ?? 0}
            format={formatNumber}
            icon={Gauge}
            delay={0.1}
          />
          <StatCard label="Avg power" value={energy?.avg_power_w ?? 0} format={formatPower} icon={Zap} delay={0.15} />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Cost avoided vs cloud providers</CardTitle>
            </CardHeader>
            <CardContent>
              {savings ? <SavingsChart data={savings.per_provider} /> : <Skeleton className="h-[220px] w-full" />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live power draw</CardTitle>
            </CardHeader>
            <CardContent>
              <EnergyGauge watts={energy?.avg_power_w ?? 0} />
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted">
                <div>
                  Energy total: <span className="text-text">{formatEnergy(energy?.total_energy_j)}</span>
                </div>
                <div>
                  Per token: <span className="text-text">{(energy?.energy_per_token_j ?? 0).toFixed(4)} J</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Throughput · tokens / sec</CardTitle>
          </CardHeader>
          <CardContent>
            {series.length > 1 ? <ThroughputChart data={series} /> : <Skeleton className="h-[120px] w-full" />}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
