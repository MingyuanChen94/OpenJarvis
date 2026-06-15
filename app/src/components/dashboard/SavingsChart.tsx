import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip } from '@/components/dashboard/ChartTooltip';
import { formatUsd } from '@/lib/format';
import type { ProviderSavings } from '@/types';

export function SavingsChart({ data }: { data: ProviderSavings[] }) {
  const rows = data.map((p) => ({ name: p.label ?? p.provider, cost: Number(p.total_cost ?? 0) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatUsd(Number(v))}
          tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <RTooltip
          cursor={{ fill: 'var(--color-surface-2)' }}
          content={<ChartTooltip formatter={formatUsd} />}
        />
        <Bar dataKey="cost" radius={[6, 6, 0, 0]} isAnimationActive={false}>
          {rows.map((_, i) => (
            <Cell key={i} fill="var(--color-accent)" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
