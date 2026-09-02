import React from 'react';

interface ScoreRingProps {
  value: number;
  size?: number;
  label?: string;
  tone?: 'forest' | 'clay' | 'muted';
  suffix?: string;
}

const STROKE: Record<string, string> = {
  forest: '#1F6247',
  clay: '#D2762F',
  muted: '#8B9A92'
};

export function ScoreRing({
  value,
  size = 84,
  label,
  tone = 'forest',
  suffix = '%'
}: ScoreRingProps) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} role="img" aria-label={`${label ?? 'Score'}: ${Math.round(pct)}${suffix}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E3E8E3"
            strokeWidth={7}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={STROKE[tone]}
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 260ms cubic-bezier(0.23, 1, 0.32, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="tabular font-semibold text-ink"
            style={{ fontSize: size * 0.26 }}
          >
            {Math.round(pct)}
            <span className="text-ink-soft" style={{ fontSize: size * 0.16 }}>
              {suffix}
            </span>
          </span>
        </div>
      </div>
      {label ? (
        <span className="mt-2 text-center text-xs font-medium text-ink-muted">{label}</span>
      ) : null}
    </div>
  );
}
