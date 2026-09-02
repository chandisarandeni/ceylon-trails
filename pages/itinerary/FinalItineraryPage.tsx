'use client';

import React from 'react';
import {
  BedIcon,
  CheckCircle2Icon,
  ClockIcon,
  CoinsIcon,
  CompassIcon,
  MapIcon,
  PrinterIcon,
  SparklesIcon,
  TrophyIcon
} from 'lucide-react';
import { getPoint, pointName } from '../../lib/data/attractions';
import { CandidatePlan } from '../../types/tourism';
import { usePlannerStore } from '../../store/usePlannerStore';
import { EmptyPipelineState } from '../../components/EmptyPipelineState';
import { PlanSelector } from '../../components/PlanSelector';
import { RouteTimeline } from '../../components/RouteTimeline';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button, ButtonLink } from '../../components/ui/Button';
import { ProgressBar, StatTile } from '../../components/ui/Metrics';
import { formatHours, formatKm, formatPct, formatRs } from '../../utils/format';

export function FinalItineraryPage() {
  const { result, activePlanId, setActivePlanId, preferences } = usePlannerStore();

  if (!result) return <EmptyPipelineState moduleName="Final Itinerary" />;

  const plan = result.plans.find((p) => p.id === activePlanId) ?? result.plans[0];
  const r = plan.resources;
  const isRecommended = plan.id === result.recommendedPlanId;

  const whyReasons = [
    `Ranked #${result.plans.indexOf(plan) + 1} across ${result.plans.length} candidate plans evaluated by Module 5`,
    `${plan.interestScore}% preliminary interest match against your preferences`,
    `Optimised by Module 1: ${formatKm(plan.route.totalDistanceKm)} total travel over ${formatHours(plan.route.totalTravelHours)}`,
    r.feasible
      ? 'Fully feasible: fits within budget, trip duration and daily travel limits'
      : 'Contains constraint violations (flagged by Module 2)',
    ...plan.matchReasons
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="forest" mono>
              FINAL OUTPUT • CUSTOMER ITINERARY
            </Badge>
            {isRecommended ? (
              <Badge tone="forest">
                <TrophyIcon className="h-3 w-3" aria-hidden /> RECOMMENDED
              </Badge>
            ) : null}
            {r.feasible ? (
              <Badge tone="forest">FEASIBLE</Badge>
            ) : (
              <Badge tone="alert">INFEASIBLE</Badge>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Personalised Sri Lanka Travel Itinerary
          </h1>
          <p className="mt-1 text-base text-ink-muted">
            Prepared for {preferences.name} ({preferences.country}) • {preferences.days} days •{' '}
            {preferences.travelStyle} • {preferences.transport}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <PrinterIcon className="h-4 w-4" aria-hidden />
            Print itinerary
          </Button>
          <ButtonLink href="/compare" variant="secondary" size="sm">
            Compare plans
          </ButtonLink>
        </div>
      </header>

      <PlanSelector
        plans={result.plans}
        activePlanId={plan.id}
        onSelect={setActivePlanId}
        label="Switch active itinerary view"
      />

      <section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            label="Total cost"
            value={formatRs(r.totalCost)}
            hint={`Budget: ${formatRs(preferences.budget)}`}
            tone={r.budgetFeasible ? 'default' : 'alert'}
            icon={<CoinsIcon className="h-3.5 w-3.5" aria-hidden />}
          />
          <StatTile
            label="Duration"
            value={`${r.daysRequired} days`}
            hint={`${r.accommodationNights} nights lodging`}
            icon={<CompassIcon className="h-3.5 w-3.5" aria-hidden />}
          />
          <StatTile
            label="Travel distance"
            value={formatKm(plan.route.totalDistanceKm)}
            hint={`${formatHours(plan.route.totalTravelHours)} total transfer`}
            icon={<MapIcon className="h-3.5 w-3.5" aria-hidden />}
          />
          <StatTile
            label="Peak travel / day"
            value={formatHours(r.peakDailyTravelHours)}
            hint={`Cap: ${preferences.maxDailyTravelHours}h`}
            tone={r.dailyTravelFeasible ? 'default' : 'alert'}
            icon={<ClockIcon className="h-3.5 w-3.5" aria-hidden />}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card>
            <CardHeader
              eyebrow="FINAL ROUTE"
              title="Visiting order"
              right={
                <Badge tone="neutral" mono>
                  <MapIcon className="h-3 w-3" aria-hidden /> {plan.route.legs.length} legs
                </Badge>
              }
            />
            <CardBody>
              <RouteTimeline order={plan.route.order} legs={plan.route.legs} compact />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              eyebrow="WHY THIS PLAN?"
              title="Decision rationale"
              subtitle="Produced by Module 5 from the outputs of every previous module."
            />
            <CardBody>
              <ul className="space-y-2">
                {whyReasons.map((reason) => (
                  <li key={reason} className="flex gap-2 text-sm text-ink-muted">
                    <CheckCircle2Icon
                      className="mt-0.5 h-4 w-4 shrink-0 text-forest-600"
                      aria-hidden
                    />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
              {plan.score ? (
                <dl className="mt-4 space-y-2.5 border-t border-line pt-4">
                  {[
                    ['Interest satisfaction', plan.score.interestSatisfaction],
                    ['Budget efficiency', plan.score.budgetEfficiency],
                    ['Travel efficiency', plan.score.travelEfficiency],
                    ['Time suitability', plan.score.timeSuitability]
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <div className="mb-1 flex items-baseline justify-between gap-3">
                        <dt className="text-xs font-medium text-ink-muted">{label as string}</dt>
                        <dd className="tabular text-xs font-semibold text-ink">
                          {formatPct(value as number)}
                        </dd>
                      </div>
                      <ProgressBar value={(value as number) * 100} height={6} label={label as string} />
                    </div>
                  ))}
                </dl>
              ) : null}
            </CardBody>
          </Card>

          {r.knapsack.selected.length ? (
            <Card>
              <CardHeader
                eyebrow="OPTIONAL EXTRAS"
                title="Added from unused budget"
                subtitle="Selected by the Module 2 knapsack allocation."
              />
              <CardBody>
                <ul className="space-y-2">
                  {r.knapsack.selected.map((item) => (
                    <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                      <span>
                        <span className="block font-medium text-ink">{item.name}</span>
                        <span className="block text-xs text-ink-muted">{item.city}</span>
                      </span>
                      <span className="tabular shrink-0 font-medium text-ink-muted">
                        {formatRs(item.cost)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ) : null}
        </div>

        <Card>
          <CardHeader
            eyebrow="DAY BY DAY"
            title="Daily itinerary"
            subtitle="Costs, travel time, accommodation and the running budget for each day."
            right={
              <Badge tone="neutral" mono>
                {plan.days.length} days planned
              </Badge>
            }
          />
          <CardBody className="space-y-3">
            {plan.days.map((day) => (
              <article key={day.day} className="rounded-xl border border-line p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] text-forest-500">DAY {day.day}</p>
                    <h3 className="mt-0.5 text-sm font-semibold text-ink">
                      {day.fromId && day.fromId !== day.toId
                        ? `${getPoint(day.fromId).city} → ${getPoint(day.toId).city}`
                        : getPoint(day.toId).city}
                    </h3>
                    <p className="text-xs text-ink-muted">{day.note}</p>
                  </div>
                  <div className="text-right">
                    <p className="tabular text-sm font-semibold text-ink">
                      {formatRs(day.dayCost)}
                    </p>
                    <p className="tabular text-xs text-ink-muted">
                      remaining {formatRs(day.remainingBudget)}
                    </p>
                  </div>
                </div>

                {day.activities.length ? (
                  <ul className="mt-3 space-y-1.5">
                    {day.activities.map((activity) => (
                      <li
                        key={activity.name}
                        className="flex items-start justify-between gap-3 text-sm"
                      >
                        <span className="flex items-start gap-1.5">
                          <SparklesIcon
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-clay-500"
                            aria-hidden
                          />
                          <span className="text-ink">{activity.name}</span>
                        </span>
                        <span className="tabular shrink-0 text-xs text-ink-muted">
                          {formatHours(activity.hours)} • {formatRs(activity.cost)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-ink-muted">
                    No scheduled attraction – rest, local exploration or buffer for delays.
                  </p>
                )}

                <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-line pt-3 text-xs text-ink-muted">
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="h-3.5 w-3.5" aria-hidden />
                    <dt className="sr-only">Travel</dt>
                    <dd className="tabular">
                      {day.travelHours > 0
                        ? `${formatHours(day.travelHours)} • ${day.transport}`
                        : 'No transfer'}
                    </dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CoinsIcon className="h-3.5 w-3.5" aria-hidden />
                    <dt className="sr-only">Travel cost</dt>
                    <dd className="tabular">{formatRs(day.travelCost)} transport</dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BedIcon className="h-3.5 w-3.5" aria-hidden />
                    <dt className="sr-only">Accommodation</dt>
                    <dd className="tabular">
                      {day.accommodation
                        ? `${formatRs(day.accommodationCost)} • ${day.accommodation}`
                        : 'Departure day – no stay'}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/compare" variant="secondary">
          Compare all candidate plans
        </ButtonLink>
        <ButtonLink href="/dashboard" variant="secondary">
          Open dashboard
        </ButtonLink>
        <ButtonLink href="/planner">Plan another trip</ButtonLink>
      </div>
    </div>
  );
}

export default FinalItineraryPage;

