import React from 'react';
import { RouteIcon } from 'lucide-react';
import { ButtonLink } from './ui/Button';

export function EmptyPipelineState({ moduleName }: { moduleName: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-50 text-forest-600">
        <RouteIcon className="h-6 w-6" aria-hidden />
      </span>
      <h1 className="mt-4 text-xl font-semibold text-ink">{moduleName} has no data yet</h1>
      <p className="mt-2 text-sm text-ink-muted">
        The pipeline runs in a fixed order. Enter the tourist’s preferences and generate candidate
        plans first – every module downstream consumes the previous module’s output.
      </p>
      <ButtonLink to="/planner" className="mt-5">
        Go to Trip Planner
      </ButtonLink>
    </div>
  );
}
