export function formatRs(value: number): string {
  return `Rs.${Math.round(value).toLocaleString('en-US')}`;
}

export function formatRsShort(value: number): string {
  if (Math.abs(value) >= 1000) return `Rs.${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  return `Rs.${Math.round(value)}`;
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatKm(km: number): string {
  return `${Math.round(km)} km`;
}

export function formatPct(value0to1: number): string {
  return `${Math.round(value0to1 * 100)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
