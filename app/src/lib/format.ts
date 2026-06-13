export function formatUsd(n: number | undefined | null): string {
  if (n == null || !isFinite(n)) return '$0.00';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  if (abs >= 1_000) return '$' + (n / 1_000).toFixed(1) + 'k';
  return '$' + n.toFixed(2);
}

export function formatNumber(n: number | undefined | null): string {
  if (n == null || !isFinite(n)) return '0';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (abs >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return Math.round(n).toString();
}

/** Joules → human-friendly energy string (J / kJ, plus Wh for larger values). */
export function formatEnergy(joules: number | undefined | null): string {
  if (joules == null || !isFinite(joules)) return '0 J';
  if (joules >= 3600) return (joules / 3600).toFixed(2) + ' Wh';
  if (joules >= 1000) return (joules / 1000).toFixed(2) + ' kJ';
  return joules.toFixed(0) + ' J';
}

export function formatPower(watts: number | undefined | null): string {
  if (watts == null || !isFinite(watts)) return '0 W';
  return watts.toFixed(1) + ' W';
}

export function formatRelativeTime(ts: number | undefined | null): string {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const sec = Math.round(diff / 1000);
  if (sec < 45) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(ts).toLocaleDateString();
}
