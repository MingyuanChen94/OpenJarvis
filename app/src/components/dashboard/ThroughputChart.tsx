import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';

export function ThroughputChart({ data }: { data: { t: number; v: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="oj-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={[0, 'dataMax + 10']} />
        <Area
          type="monotone"
          dataKey="v"
          stroke="var(--color-accent)"
          strokeWidth={2}
          fill="url(#oj-area)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
