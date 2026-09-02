import React from 'react';
import { ArrowRightIcon, ArrowLeftIcon, ArrowDownIcon } from 'lucide-react';
import { Badge } from './ui/Badge';
import { ButtonLink } from './ui/Button';

export function ModuleHeader({
  moduleTag,
  pipelinePosition,
  title,
  purpose,
  algorithms
}: {
  moduleTag: string;
  pipelinePosition: string;
  title: string;
  purpose: string;
  algorithms: string[];
}) {
  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="forest" mono>
          {moduleTag}
        </Badge>
        <Badge tone="neutral" mono>
          {pipelinePosition}
        </Badge>
      </div>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-base text-ink-muted">{purpose}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {algorithms.map((algorithm) => (
          <span
            key={algorithm}
            className="rounded-md border border-line bg-surface px-2 py-1 font-mono text-[11px] text-ink-muted"
          >
            {algorithm}
          </span>
        ))}
      </div>
    </header>
  );
}

interface IOItem {
  label: string;
  value: string;
}

export function IOPanel({
  input,
  processing,
  output,
  handoff
}: {
  input: IOItem[];
  processing: string[];
  output: IOItem[];
  handoff: string;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <IOColumn title="Input received" items={input} />
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <p className="mb-3 font-mono text-[11px] font-medium text-forest-500">PROCESSING</p>
        <ol className="space-y-2">
          {processing.map((step, index) => (
            <li key={step} className="flex gap-2.5 text-sm text-ink-muted">
              <span className="tabular mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-50 text-[10px] font-semibold text-forest-700">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-2xl border border-forest-200 bg-forest-50 p-4">
        <p className="mb-3 font-mono text-[11px] font-medium text-forest-600">OUTPUT PRODUCED</p>
        <dl className="space-y-2">
          {output.map((item) => (
            <div key={item.label} className="flex items-baseline justify-between gap-3">
              <dt className="text-sm text-forest-700">{item.label}</dt>
              <dd className="tabular text-sm font-semibold text-forest-800">{item.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 flex items-start gap-1.5 border-t border-forest-200 pt-3 text-xs text-forest-700">
          <ArrowDownIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{handoff}</span>
        </p>
      </div>
    </div>
  );
}

function IOColumn({ title, items }: { title: string; items: IOItem[] }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <p className="mb-3 font-mono text-[11px] font-medium text-ink-soft">
        {title.toUpperCase()}
      </p>
      <dl className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-sm text-ink-muted">{item.label}</dt>
            <dd className="tabular text-right text-sm font-semibold text-ink">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function StepNav({
  backTo,
  backLabel,
  nextTo,
  nextLabel,
  note
}: {
  backTo: string;
  backLabel: string;
  nextTo: string;
  nextLabel: string;
  note?: string;
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
      <ButtonLink to={backTo} variant="secondary" size="sm">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        {backLabel}
      </ButtonLink>
      {note ? <p className="order-3 w-full text-xs text-ink-muted sm:order-2 sm:w-auto">{note}</p> : null}
      <ButtonLink to={nextTo} size="md" className="order-2 sm:order-3">
        {nextLabel}
        <ArrowRightIcon className="h-4 w-4" aria-hidden />
      </ButtonLink>
    </div>
  );
}
