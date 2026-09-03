import React from 'react';
import { CandidatePlan } from '../types/tourism';

export function PlanSelector({
  plans,
  activePlanId,
  onSelect,
  label = 'Select candidate plan'
}: {
  plans: CandidatePlan[];
  activePlanId: string | null;
  onSelect: (id: string) => void;
  label?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-1.5 overflow-x-auto rounded-xl border border-line bg-surface p-1.5"
    >
      {plans.map((plan) => {
        const active = plan.id === activePlanId;
        return (
          <button
            key={plan.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(plan.id)}
            className={`flex shrink-0 flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left transition-colors duration-150 ease-out cursor-pointer ${
              active
                ? 'bg-forest-700 text-white'
                : 'text-ink-muted hover:bg-canvas hover:text-forest-700'
            }`}
          >
            <span className="text-sm font-semibold">{plan.label}</span>
            <span
              className={`font-mono text-[10px] ${active ? 'text-white/75' : 'text-ink-soft'}`}
            >
              {plan.strategy}
            </span>
          </button>
        );
      })}
    </div>
  );
}
