'use client';

import React, { useEffect } from 'react';
import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import { ResourceAllocation } from '../../types/tourism';
import { usePlannerStore } from '../../store/usePlannerStore';
import { EmptyPipelineState } from '../../components/EmptyPipelineState';
import { IOPanel, ModuleHeader, StepNav } from '../../components/ModuleShell';
import { PlanSelector } from '../../components/PlanSelector';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { ProgressBar, StatTile } from '../../components/ui/Metrics';
import { TableWrap, TD, TH } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { formatHours, formatRs, formatRsShort } from '../../utils/format';

const COST_KEYS: { key: keyof ResourceAllocation; label: string; tone: string }[] = [
  { key: 'transportCost', label: 'Transport', tone: 'bg-forest-600' },
  { key: 'accommodationCost', label: 'Accommodation', tone: 'bg-forest-400' },
  { key: 'foodCost', label: 'Food & dining', tone: 'bg-clay-500' },
  { key: 'activityCost', label: 'Activities & entry', tone: 'bg-gold-500' },
  { key: 'emergencyReserve', label: 'Emergency reserve', tone: 'bg-[#8B9A92]' }
];

export function ModuleResourcesPage() {
  const { result, activePlanId, setActivePlanId, preferences, markCompleted } = usePlannerStore();

  useEffect(() => {
    if (result) markCompleted('resources');
  }, [result, markCompleted]);

  if (!result) return <EmptyPipelineState moduleName="Module 2 – Resource Allocation" />;

  const plan = result.plans.find((p) => p.id === activePlanId) ?? result.plans[0];
  const r = plan.resources;

  return (
    <div>
      <ModuleHeader
        moduleTag="STEP 4"
        title="Budget & Cost Breakdown"
        purpose="Here’s a full breakdown of your trip costs — accommodation, transport, meals, activities, and emergency reserve — so you know exactly what fits within your budget."
      />



      <div className="mt-6">
        <PlanSelector
          plans={result.plans}
          activePlanId={plan.id}
          onSelect={setActivePlanId}
          label="View budget breakdown for a trip option"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader
            eyebrow={`${plan.label} BUDGET & TIME`}
            title="Cost breakdown & feasibility"
            right={
              r.feasible ? (
                <Badge tone="forest">FEASIBLE</Badge>
              ) : (
                <Badge tone="alert">NOT FEASIBLE</Badge>
              )
            }
          />
          <CardBody className="space-y-4">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-canvas">
              {COST_KEYS.map((item) => (
                <span
                  key={item.key}
                  className={item.tone}
                  style={{ width: `${((r[item.key] as number) / Math.max(r.totalCost, 1)) * 100}%` }}
                  title={`${item.label}: ${formatRs(r[item.key] as number)}`}
                />
              ))}
            </div>

            <dl className="space-y-2 text-sm">
              {COST_KEYS.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-ink-muted">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.tone}`} aria-hidden />
                    {item.label}
                    {item.key === 'accommodationCost' ? (
                      <span className="text-xs text-ink-soft">
                        ({r.accommodationNights} nights)
                      </span>
                    ) : null}
                    {item.key === 'activityCost' && r.optionalActivityCost > 0 ? (
                      <span className="text-xs text-ink-soft">
                        (incl. {formatRs(r.optionalActivityCost)} optional)
                      </span>
                    ) : null}
                  </dt>
                  <dd className="tabular font-semibold text-ink">
                    {formatRs(r[item.key] as number)}
                  </dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 border-t border-line pt-2">
                <dt className="font-semibold text-ink">Total trip cost</dt>
                <dd className="tabular text-lg font-semibold text-ink">{formatRs(r.totalCost)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">Budget</dt>
                <dd className="tabular font-medium text-ink">{formatRs(preferences.budget)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">Remaining budget</dt>
                <dd
                  className={`tabular font-semibold ${
                    r.remainingBudget >= 0 ? 'text-forest-700' : 'text-alert-600'
                  }`}
                >
                  {formatRs(r.remainingBudget)}
                </dd>
              </div>
            </dl>

            <div className="space-y-2">
              <ConstraintRow
                label={`Total cost ≤ ${formatRs(preferences.budget)}`}
                ok={r.budgetFeasible}
                value={`${Math.round((r.totalCost / preferences.budget) * 100)}% of budget used`}
                ratio={(r.totalCost / preferences.budget) * 100}
              />
              <ConstraintRow
                label={`Planned days ≤ ${preferences.days}`}
                ok={r.timeFeasible}
                value={`${r.daysRequired} days required`}
                ratio={(r.daysRequired / preferences.days) * 100}
              />
              <ConstraintRow
                label={`Daily transfers ≤ ${preferences.maxDailyTravelHours}h`}
                ok={r.dailyTravelFeasible}
                value={`peak ${formatHours(r.peakDailyTravelHours)}`}
                ratio={(r.peakDailyTravelHours / preferences.maxDailyTravelHours) * 100}
              />
            </div>

            <ul className="space-y-1.5">
              {r.notes.map((note) => (
                <li key={note} className="text-xs text-ink-muted">
                  • {note}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              eyebrow="BONUS EXPERIENCES"
              title="Optional extras added within your remaining budget"
              subtitle={`You have ${formatRs(
                r.knapsack.capacity
              )} left after essential costs — here are the extra experiences we’ve added for you.`}
            />
            <CardBody className="px-0 py-0">
              <TableWrap>
                <thead>
                  <tr>
                    <TH>Optional experience</TH>
                    <TH>City</TH>
                    <TH align="right">Cost</TH>
                    <TH align="right">Value</TH>
                    <TH align="center">Selected</TH>
                  </tr>
                </thead>
                <tbody>
                  {r.knapsack.considered.length === 0 ? (
                    <tr>
                      <TD className="text-ink-muted">
                        No optional experiences available for these destinations.
                      </TD>
                      <TD>–</TD>
                      <TD align="right">–</TD>
                      <TD align="right">–</TD>
                      <TD align="center">–</TD>
                    </tr>
                  ) : (
                    r.knapsack.considered.map((item) => {
                      const selected = r.knapsack.selected.some((s) => s.id === item.id);
                      return (
                        <tr key={item.id} className={selected ? 'bg-forest-50/60' : ''}>
                          <TD>{item.name}</TD>
                          <TD className="text-ink-muted">{item.city}</TD>
                          <TD align="right" mono>
                            {formatRs(item.cost)}
                          </TD>
                          <TD align="right" mono>
                            {item.value.toFixed(1)}
                          </TD>
                          <TD align="center">
                            {selected ? (
                              <Badge tone="forest">In plan</Badge>
                            ) : (
                              <span className="text-xs text-ink-soft">Skipped</span>
                            )}
                          </TD>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </TableWrap>
            </CardBody>
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Bonus value" value={r.knapsack.totalValue.toFixed(1)} hint="Optional extras added" />
            <StatTile label="Extras spend" value={formatRsShort(r.knapsack.totalCost)} />
            <StatTile label="Nights" value={r.accommodationNights} />
            <StatTile
              label="Days used"
              value={`${r.daysRequired}/${preferences.days}`}
              tone={r.timeFeasible ? 'default' : 'alert'}
            />
          </div>
        </div>
      </div>

      <StepNav
        backTo="/route"
        backLabel="Back to route"
        nextTo="/optimization"
        nextLabel="See final recommendation"
      />
    </div>
  );
}

function ConstraintRow({
  label,
  ok,
  value,
  ratio
}: {
  label: string;
  ok: boolean;
  value: string;
  ratio: number;
}) {
  return (
    <div className="rounded-xl border border-line p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
          {ok ? (
            <CheckCircle2Icon className="h-4 w-4 text-forest-600" aria-hidden />
          ) : (
            <XCircleIcon className="h-4 w-4 text-alert-500" aria-hidden />
          )}
          {label}
        </p>
        <p className="tabular text-xs text-ink-muted">{value}</p>
      </div>
      <div className="mt-2">
        <ProgressBar
          value={Math.min(ratio, 100)}
          tone={ok ? 'forest' : 'alert'}
          height={6}
          label={label}
        />
      </div>
    </div>
  );
}

export default ModuleResourcesPage;

