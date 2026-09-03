import React from 'react';
import { ArrowRightIcon, ArrowLeftIcon } from 'lucide-react';
import { Badge } from './ui/Badge';
import { ButtonLink } from './ui/Button';

export function ModuleHeader({
  moduleTag,
  title,
  purpose
}: {
  moduleTag: string;
  pipelinePosition?: string;
  title: string;
  purpose: string;
  algorithms?: string[];
}) {
  return (
    <header className="mb-6">
      <Badge tone="forest" mono>
        {moduleTag}
      </Badge>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-base text-ink-muted">{purpose}</p>
    </header>
  );
}

interface IOItem {
  label: string;
  value: string;
}

/** @deprecated IOPanel shows academic pipeline details — use plain summary cards instead */
export function IOPanel(_props: {
  input: IOItem[];
  processing: string[];
  output: IOItem[];
  handoff: string;
}) {
  // Hidden from tourist-facing UI
  return null;
}

export function StepNav({
  backTo,
  backLabel,
  nextTo,
  nextLabel
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
      <ButtonLink to={nextTo} size="md">
        {nextLabel}
        <ArrowRightIcon className="h-4 w-4" aria-hidden />
      </ButtonLink>
    </div>
  );
}
