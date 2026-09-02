import React from 'react';

type Tone = 'neutral' | 'forest' | 'clay' | 'gold' | 'alert' | 'outline';

const TONES: Record<Tone, string> = {
  neutral: 'bg-canvas text-ink-muted border-line',
  forest: 'bg-forest-50 text-forest-700 border-forest-100',
  clay: 'bg-clay-50 text-clay-600 border-clay-100',
  gold: 'bg-gold-50 text-gold-500 border-gold-100',
  alert: 'bg-alert-50 text-alert-600 border-alert-100',
  outline: 'bg-transparent text-ink-muted border-line'
};

export function Badge({
  children,
  tone = 'neutral',
  mono = false,
  className = ''
}: {
  children: React.ReactNode;
  tone?: Tone;
  mono?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        mono ? 'font-mono text-[11px]' : ''
      } ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
