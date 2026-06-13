interface TooltipPayload {
  name?: string;
  value?: number | string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
  formatter?: (v: number) => string;
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-md">
      {label != null && <div className="mb-0.5 font-medium text-text">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="text-muted">
          <span className="text-text">
            {typeof p.value === 'number' && formatter ? formatter(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}
