import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

export function EnergyGauge({ watts, max = 100 }: { watts: number; max?: number }) {
  const data = [{ name: 'power', value: Math.max(0, Math.min(watts, max)) }];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart
          innerRadius="72%"
          outerRadius="100%"
          data={data}
          startAngle={220}
          endAngle={-40}
        >
          <PolarAngleAxis type="number" domain={[0, max]} tick={false} />
          <RadialBar
            dataKey="value"
            cornerRadius={12}
            fill="var(--color-accent)"
            background={{ fill: 'var(--color-surface-2)' }}
            isAnimationActive={false}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums">{watts.toFixed(1)}</span>
        <span className="text-xs text-muted">watts</span>
      </div>
    </div>
  );
}
