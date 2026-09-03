import React from 'react';
import { RouteIcon } from 'lucide-react';
import { ButtonLink } from './ui/Button';

export function EmptyPipelineState({ moduleName }: { moduleName: string }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-line bg-surface p-8 text-center shadow-card">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-50 text-forest-600">
        <RouteIcon className="h-6 w-6" aria-hidden />
      </span>
      <h1 className="mt-4 text-xl font-semibold text-ink">No trip data yet</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Start by entering your travel preferences in the Trip Planner. Once you generate plans, you can explore all your results here.
      </p>
      <ButtonLink to="/planner" className="mt-5">
        Go to Trip Planner
      </ButtonLink>
    </div>
  );
}
