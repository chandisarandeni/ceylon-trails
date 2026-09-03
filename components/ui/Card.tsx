import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
}

export function Card({ children, className = '', as = 'div' }: CardProps) {
  const Tag = as;
  return (
    <Tag className={`rounded-2xl border border-line bg-surface shadow-card ${className}`}>
      {children}
    </Tag>
  );
}

interface CardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, eyebrow, right, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 ${className}`}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 font-mono text-[11px] font-medium text-forest-500">{eyebrow}</p>
        ) : null}
        <h2 className="text-base font-semibold leading-tight text-ink">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-ink-muted">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

export function CardBody({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
