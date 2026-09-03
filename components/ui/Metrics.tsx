import React from 'react';

export function StatTile({
  label,
  value,
  hint,
  tone = 'default',
  icon
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: 'default' | 'accent' | 'alert';
  icon?: React.ReactNode;
}) {
  const toneClass =
    tone === 'accent'
      ? 'border-forest-200 bg-forest-50'
      : tone === 'alert'
      ? 'border-alert-100 bg-alert-50'
      : 'border-line bg-surface';
  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="flex items-center gap-2">
        {icon ? <span className="text-forest-500">{icon}</span> : null}
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      </div>
      <p className="tabular mt-2 text-2xl font-semibold leading-none text-ink">{value}</p>
      {hint ? <p className="mt-1.5 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}

export function ProgressBar({
  value,
  tone = 'forest',
  height = 8,
  label
}: {
  value: number;
  tone?: 'forest' | 'clay' | 'alert' | 'soft';
  height?: number;
  label?: string;
}) {
  const colors: Record<string, string> = {
    forest: 'bg-forest-600',
    clay: 'bg-clay-500',
    alert: 'bg-alert-500',
    soft: 'bg-forest-300'
  };
  return (
    <div
      className="w-full overflow-hidden rounded-full bg-canvas"
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={`h-full rounded-full ${colors[tone]}`}
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          transition: 'width 240ms cubic-bezier(0.23, 1, 0.32, 1)'
        }}
      />
    </div>
  );
}

export interface CompareRow {
  id: string;
  label: string;
  value: number;
  display: string;
  highlight?: boolean;
  muted?: boolean;
}

export function CompareChart({
  title,
  rows,
  invert = false
}: {
  title: string;
  rows: CompareRow[];
  invert?: boolean;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-ink">{title}</p>
      <ul className="space-y-2.5">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs font-medium text-ink-muted">{row.label}</span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-canvas">
              <span
                className={`block h-full rounded-full ${
                  row.muted
                    ? 'bg-line'
                    : row.highlight
                    ? 'bg-forest-600'
                    : invert
                    ? 'bg-clay-300'
                    : 'bg-forest-300'
                }`}
                style={{ width: `${(row.value / max) * 100}%` }}
              />
            </span>
            <span
              className={`tabular w-24 shrink-0 text-right text-xs font-semibold ${
                row.muted ? 'text-ink-soft' : 'text-ink'
              }`}
            >
              {row.display}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
