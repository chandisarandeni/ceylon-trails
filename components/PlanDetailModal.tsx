import React from 'react';
import { XIcon } from 'lucide-react';
import { ATTRACTION_MAP, pointName } from '../lib/data/attractions';
import { CandidatePlan } from '../types/tourism';
import { formatHours, formatKm, formatRs } from '../utils/format';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { RouteTimeline } from './RouteTimeline';

export function PlanDetailModal({
  plan,
  onClose
}: {
  plan: CandidatePlan | null;
  onClose: () => void;
}) {
  if (!plan) return null;
  const r = plan.resources;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${plan.label} details`}
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-surface shadow-pop sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-line bg-surface px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-ink">{plan.label}</h2>
              <Badge tone="forest" mono>
                {plan.strategy}
              </Badge>
              {r.feasible ? (
                <Badge tone="forest">Feasible</Badge>
              ) : (
                <Badge tone="alert">Not feasible</Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-ink-muted">{plan.strategyNote}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} ariaLabel="Close plan details">
            <XIcon className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
          <section>
            <h3 className="mb-2 text-sm font-semibold text-ink">Attractions selected (Module 4)</h3>
            <ul className="space-y-2">
              {plan.attractionIds.map((id) => {
                const a = ATTRACTION_MAP[id];
                if (!a) return null;
                return (
                  <li key={id} className="rounded-xl border border-line p-3">
                    <p className="text-sm font-medium text-ink">{a.name}</p>
                    <p className="text-xs text-ink-muted">
                      {a.city} • {a.province} • best {a.recommendedSeason}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">{a.description}</p>
                    <p className="tabular mt-1.5 text-xs font-medium text-forest-700">
                      {formatRs(a.activityCost)} • {a.visitDuration}h • popularity {a.popularity}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="space-y-5">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-ink">
                Optimised route (Module 1)
              </h3>
              <RouteTimeline order={plan.route.order} legs={plan.route.legs} compact />
              <p className="tabular text-xs text-ink-muted mt-2">
                {formatKm(plan.route.totalDistanceKm)} •{' '}
                {formatHours(plan.route.totalTravelHours)} •{' '}
                {formatRs(plan.route.totalTravelCost)} • {plan.route.method}
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-ink">
                Resource allocation (Module 2)
              </h3>
              <dl className="space-y-1.5 rounded-xl border border-line p-3 text-sm">
                {[
                  ['Transport', r.transportCost],
                  [`Accommodation (${r.accommodationNights} nights)`, r.accommodationCost],
                  ['Food', r.foodCost],
                  ['Activities', r.activityCost],
                  ['Emergency reserve', r.emergencyReserve]
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between gap-3">
                    <dt className="text-ink-muted">{label}</dt>
                    <dd className="tabular font-medium text-ink">{formatRs(value as number)}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-3 border-t border-line pt-1.5">
                  <dt className="font-semibold text-ink">Total</dt>
                  <dd className="tabular font-semibold text-ink">{formatRs(r.totalCost)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-muted">Remaining</dt>
                  <dd
                    className={`tabular font-semibold ${
                      r.remainingBudget >= 0 ? 'text-forest-700' : 'text-alert-600'
                    }`}
                  >
                    {formatRs(r.remainingBudget)}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-ink">Network summary (Module 3)</h3>
              <p className="text-xs text-ink-muted">
                {plan.network.nodeIds.length} nodes • {plan.network.edges.length} connections • most
                connected: {pointName(plan.network.mostConnectedId)} • avg edge{' '}
                {formatKm(plan.network.avgDistanceKm)}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
