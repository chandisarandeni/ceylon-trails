import React from 'react';

export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function TH({
  children,
  align = 'left',
  className = ''
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`border-b border-line px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-muted ${
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
      } ${className}`}
    >
      {children}
    </th>
  );
}

export function TD({
  children,
  align = 'left',
  className = '',
  mono = false
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
  mono?: boolean;
}) {
  return (
    <td
      className={`border-b border-line px-3 py-3 align-middle ${
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
      } ${mono ? 'tabular font-medium' : ''} ${className}`}
    >
      {children}
    </td>
  );
}
