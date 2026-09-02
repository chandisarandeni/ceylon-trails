import React from 'react';
import { CheckCircle2Icon, ClockIcon, CoinsIcon, XCircleIcon } from 'lucide-react';
import { ATTRACTION_MAP } from '../lib/data/attractions';
import { CandidatePlan } from '../types/tourism';
import { formatHours, formatRs, formatRsShort } from '../utils/format';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { ScoreRing } from './ui/ScoreRing';

export function PlanCard({
  plan,
  isRecommended,
  onViewDetails,
  showFeasibility = false,
  showOverall = false
}: {
  plan: CandidatePlan;
  isRecommended?: boolean;
  onViewDetails: () => void;
  showFeasibility?: boolean;
  showOverall?: boolean;
}) {
  const overall = plan.score ? Math.round(plan.score.overallScore * 100) : null;

  return (
    <article
      className={`flex h-full flex-col rounded-2xl border bg-surface shadow-card ${
        isRecommended ? 'border-forest-500 ring-1 ring-forest-500' : 'border-line'
      }`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-ink">{plan.label}</h3>
            {isRecommended ? <Badge tone="forest">Recommended</Badge> : null}
            {showFeasibility ? (
              plan.resources.feasible ? (
                <Badge tone="forest">
                  <CheckCircle2Icon className="h-3 w-3" aria-hidden /> Feasible
                </Badge>
              ) : (
                <Badge tone="alert">
                  <XCircleIcon className="h-3 w-3" aria-hidden /> Not feasible
                </Badge>
              )
            ) : null}
          </div>
          <p className="mt-1 font-mono text-[11px] text-forest-500">{plan.strategy}</p>
        </div>
        <ScoreRing
          value={showOverall && overall !== null ? overall : plan.interestScore}
          size={62}
          tone={plan.excluded ? 'muted' : 'forest'}
          label={showOverall && overall !== null ? 'Overall' : 'Interest'}
        />
      </div>

      <div className="flex flex-1 flex-col px-5 py-4">
        <ul className="space-y-2">
          {plan.attractionIds.map((id) => {
            const attraction = ATTRACTION_MAP[id];
            if (!attraction) return null;
            return (
              <li key={id} className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">
                    {attraction.name}
                  </span>
                  <span className="block text-xs text-ink-muted">
                    {attraction.city} • {attraction.province}
                  </span>
                </span>
                <span className="tabular shrink-0 text-xs font-medium text-ink-muted">
                  {formatRsShort(attraction.activityCost)}
                </span>
              </li>
            );
          })}
        </ul>

        <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4 text-sm">
          <div>
            <dt className="flex items-center gap-1 text-xs text-ink-muted">
              <CoinsIcon className="h-3.5 w-3.5" aria-hidden /> Activity cost
            </dt>
            <dd className="tabular font-semibold text-ink">{formatRs(plan.activityCost)}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-xs text-ink-muted">
              <ClockIcon className="h-3.5 w-3.5" aria-hidden /> Visit time
            </dt>
            <dd className="tabular font-semibold text-ink">
              {formatHours(plan.visitDurationHours)}
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Why this matches
          </p>
          <ul className="mt-1.5 space-y-1">
            {plan.matchReasons.slice(0, 3).map((reason) => (
              <li key={reason} className="flex gap-1.5 text-xs text-ink-muted">
                <CheckCircle2Icon
                  className="mt-0.5 h-3 w-3 shrink-0 text-forest-500"
                  aria-hidden
                />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {plan.excluded && plan.exclusionReason ? (
          <p className="mt-4 rounded-xl border border-alert-100 bg-alert-50 px-3 py-2 text-xs text-alert-600">
            {plan.exclusionReason}
          </p>
        ) : null}

        <div className="mt-auto pt-4">
          <Button variant="secondary" size="sm" onClick={onViewDetails} className="w-full">
            View details
          </Button>
        </div>
      </div>
    </article>
  );
}
