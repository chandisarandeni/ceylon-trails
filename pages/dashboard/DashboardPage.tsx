'use client';

import React from 'react';
import Link from 'next/link';
import { CandidatePlan } from '../../types/tourism';
import { usePlannerStore } from '../../store/usePlannerStore';
import { EmptyPipelineState } from '../../components/EmptyPipelineState';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatTile, CompareChart, CompareRow } from '../../components/ui/Metrics';
import { ScoreRing } from '../../components/ui/ScoreRing';
import { formatHours, formatPct, formatRs, formatRsShort } from '../../utils/format';

export function DashboardPage() {
  const { result, preferences } = usePlannerStore();

  if (!result) return <EmptyPipelineState moduleName="Dashboard" />;

  const selected = result.plans.find((p) => p.id === result.recommendedPlanId);
  const feasible = result.plans.filter((p) => p.resources.feasible);

  const rows = (
    map: (plan: CandidatePlan) => { value: number; display: string }
  ): CompareRow[] =>
    result.plans.map((plan) => ({
      id: plan.id,
      label: plan.label.replace('Plan ', 'P'),
      highlight: plan.id === result.recommendedPlanId,
      muted: plan.excluded,
      ...map(plan)
    }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="forest" mono>
            TRIP DASHBOARD
          </Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Trip summary for {preferences.name}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-ink-muted">
            An overview of your travel choices, candidate plan options, budget feasibility, and your selected itinerary.
          </p>
        </div>
        {selected?.score ? (
          <ScoreRing value={selected.score.overallScore * 100} size={96} label="Selected plan score" />
        ) : null}
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatTile label="Trip budget" value={formatRs(preferences.budget)} />
        <StatTile label="Trip duration" value={`${preferences.days} days`} />
        <StatTile label="Trip options" value={result.plans.length} hint="Personalised for you" />
        <StatTile
          label="Feasible plans"
          value={`${feasible.length} of ${result.plans.length}`}
          hint="Within your budget & time"
          tone={feasible.length ? 'default' : 'alert'}
        />
        <StatTile
          label="Selected plan"
          value={selected ? selected.label : 'None'}
          hint={selected ? selected.strategy : 'No feasible plan'}
          tone="accent"
        />
        <StatTile
          label="Interest match"
          value={selected ? `${selected.interestScore}%` : '–'}
        />
        <StatTile
          label="Total cost"
          value={selected ? formatRs(selected.resources.totalCost) : '–'}
        />
        <StatTile
          label="Remaining budget"
          value={selected ? formatRs(selected.resources.remainingBudget) : '–'}
        />
        <StatTile
          label="Travel time"
          value={selected ? formatHours(selected.route.totalTravelHours) : '–'}
          hint={selected ? `${Math.round(selected.route.totalDistanceKm)} km` : undefined}
        />
        <StatTile
          label="Days required"
          value={selected ? `${selected.resources.daysRequired}/${preferences.days}` : '–'}
        />
      </div>

      <Card>
        <CardHeader
          eyebrow="CANDIDATE PLAN COMPARISON"
          title="Four criteria, five plans"
          subtitle="Dark bar = recommended. Grey bar = excluded before scoring."
        />
        <CardBody className="grid gap-8 md:grid-cols-2">
          <CompareChart
            title="Overall score"
            rows={rows((plan) => ({
              value: plan.score ? plan.score.overallScore * 100 : 0,
              display: plan.score ? formatPct(plan.score.overallScore) : 'Excluded'
            }))}
          />
          <CompareChart
            title="Interest score"
            rows={rows((plan) => ({ value: plan.interestScore, display: `${plan.interestScore}%` }))}
          />
          <CompareChart
            title="Total cost"
            invert
            rows={rows((plan) => ({
              value: plan.resources.totalCost,
              display: formatRsShort(plan.resources.totalCost)
            }))}
          />
          <CompareChart
            title="Travel time"
            invert
            rows={rows((plan) => ({
              value: plan.route.totalTravelHours,
              display: formatHours(plan.route.totalTravelHours)
            }))}
          />
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader eyebrow="PLANNING STEPS" title="What we found for you" />
          <CardBody>
            <ol className="space-y-3">
              {[
                {
                  href: '/decision',
                  tag: 'Step 1',
                  title: 'Destination Matching',
                  value: `${result.plans.length} trip options from ${result.rankedAttractions.length} attractions matched to your interests`
                },
                {
                  href: '/network',
                  tag: 'Step 2',
                  title: 'Route Connections',
                  value: `${result.plans.reduce(
                    (sum, p) => sum + p.network.edges.length,
                    0
                  )} travel connections mapped across all trip options`
                },
                {
                  href: '/route',
                  tag: 'Step 3',
                  title: 'Best Route',
                  value: `${result.plans.length} routes optimised, shortest ${Math.min(
                    ...result.plans.map((p) => Math.round(p.route.totalDistanceKm))
                  )} km`
                },
                {
                  href: '/resources',
                  tag: 'Step 4',
                  title: 'Budget Breakdown',
                  value: `${feasible.length} trip options fit your budget, cheapest ${formatRs(
                    Math.min(...result.plans.map((p) => p.resources.totalCost))
                  )}`
                },
                {
                  href: '/optimization',
                  tag: 'Step 5',
                  title: 'Best Recommendation',
                  value: selected
                    ? `${selected.label} recommended with ${formatPct(selected.score?.overallScore ?? 0)} match score`
                    : 'No plan could be recommended'
                }
              ].map((item) => (
                <li key={item.tag}>
                  <Link
                    href={item.href}
                    className="flex items-start justify-between gap-3 rounded-xl border border-line p-3 transition-colors duration-150 ease-out hover:border-forest-300 hover:bg-forest-50/40"
                  >
                    <span>
                      <span className="font-mono text-[11px] text-forest-500">{item.tag}</span>
                      <span className="block text-sm font-semibold text-ink">{item.title}</span>
                      <span className="block text-xs text-ink-muted">{item.value}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>

        <Card>
          <CardHeader eyebrow="YOUR TRIP PREFERENCES" title="Your travel preferences" />
          <CardBody>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Tourist', `${preferences.name} (${preferences.country})`],
                ['Duration', `${preferences.days} days`],
                ['Budget', formatRs(preferences.budget)],
                ['Emergency reserve', formatRs(preferences.emergencyReserve)],
                ['Travel style', preferences.travelStyle],
                ['Transport', preferences.transport],
                ['Daily travel cap', `${preferences.maxDailyTravelHours}h`],
                ['Max destinations', `${preferences.maxDestinations}`],
                [
                  'Core interests',
                  Object.entries(preferences.interests)
                    .map(([key, level]) => `${key} ${level}`)
                    .join(', ')
                ],
                ['Optional interests', preferences.optionalInterests.join(', ') || '–']
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-line p-3">
                  <dt className="text-xs text-ink-muted">{label}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;

