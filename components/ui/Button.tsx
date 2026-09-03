import React from 'react';
import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-forest-700 text-white hover:bg-forest-800 border border-forest-700 hover:border-forest-800',
  secondary: 'bg-surface text-ink border border-line hover:border-forest-300 hover:text-forest-700',
  ghost: 'bg-transparent text-forest-700 border border-transparent hover:bg-forest-50',
  accent: 'bg-clay-500 text-white border border-clay-500 hover:bg-clay-600 hover:border-clay-600'
};

const SIZES: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-5 py-3 gap-2'
};

const BASE =
  'inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap cursor-pointer';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  onClick,
  disabled,
  ariaLabel
}: {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  type?: 'button' | 'submit';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  to,
  href,
  variant = 'primary',
  size = 'md',
  className = ''
}: {
  children: React.ReactNode;
  to?: string;
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const target = href || to || '/';
  return (
    <Link href={target} className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}>
      {children}
    </Link>
  );
}
