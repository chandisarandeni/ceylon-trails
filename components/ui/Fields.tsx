import React from 'react';
import { ChevronDownIcon, AlertCircleIcon } from 'lucide-react';

export function FieldLabel({
  label,
  hint,
  htmlFor
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
}) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {hint ? <p className="text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}

export function NumberField({
  id,
  label,
  hint,
  value,
  placeholder,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  error,
  onChange
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  error?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <FieldLabel label={label} hint={hint} htmlFor={id} />
      <div
        className={`flex items-center rounded-xl border transition-colors ${
          error
            ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100'
            : 'border-line bg-surface focus-within:border-forest-400'
        }`}
      >
        {prefix ? <span className="pl-3 font-mono text-xs text-ink-soft">{prefix}</span> : null}
        <input
          id={id}
          type="number"
          value={value === 0 ? '' : value}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              onChange(0);
            } else {
              const next = Number(raw);
              if (Number.isFinite(next)) onChange(next);
            }
          }}
          className="tabular w-full bg-transparent px-3 py-2.5 text-sm font-medium text-ink outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          onWheel={(e) => (e.target as HTMLElement).blur()}
        />
        {suffix ? <span className="pr-3 text-xs text-ink-soft">{suffix}</span> : null}
      </div>
      {error ? (
        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-600">
          <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SelectField<T extends string>({
  id,
  label,
  hint,
  value,
  options,
  icon,
  error,
  onChange
}: {
  id: string;
  label: string;
  hint?: string;
  value: T;
  options: { value: T; label: string }[];
  icon?: React.ReactNode;
  error?: string;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <FieldLabel label={label} hint={hint} htmlFor={id} />
      <div className="relative flex items-center">
        {icon ? (
          <span className="pointer-events-none absolute left-3 text-forest-600">
            {icon}
          </span>
        ) : null}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className={`w-full appearance-none rounded-xl border py-2.5 text-sm font-medium text-ink outline-none transition-colors focus:border-forest-400 cursor-pointer ${
            error
              ? 'border-red-500 bg-red-50/30 ring-2 ring-red-100'
              : 'border-line bg-surface'
          } ${icon ? 'pl-9 pr-9' : 'px-3 pr-9'}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4 text-ink-muted" />
      </div>
      {error ? (
        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-600">
          <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SegmentedControl<T extends string>({
  label,
  hint,
  value,
  options,
  onChange
}: {
  label: string;
  hint?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <div
        role="radiogroup"
        aria-label={label}
        className="flex w-full gap-1 rounded-xl border border-line bg-canvas p-1"
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors duration-150 ease-out cursor-pointer ${
                active
                  ? 'bg-forest-700 text-white'
                  : 'text-ink-muted hover:bg-surface hover:text-forest-700'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function RangeField({
  id,
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  display,
  onChange
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        <span className="tabular text-sm font-semibold text-forest-700">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-forest-100 accent-forest-700"
      />
      {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}

export function ToggleChip({
  label,
  active,
  onClick,
  icon
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ease-out cursor-pointer ${
        active
          ? 'border-forest-600 bg-forest-600 text-white'
          : 'border-line bg-surface text-ink-muted hover:border-forest-300 hover:text-forest-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
