'use client';

import React, { useEffect } from 'react';
import { TrophyIcon, XCircleIcon } from 'lucide-react';
import { DEFAULT_WEIGHTS } from '../../lib/data/defaultPreferences';
import { usePlannerStore } from '../../store/usePlannerStore';
import { EmptyPipelineState } from '../../components/EmptyPipelineState';
import { IOPanel, ModuleHeader, StepNav } from '../../components/ModuleShell';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { RangeField } from '../../components/ui/Fields';
import { ProgressBar } from '../../components/ui/Metrics';
import { TableWrap, TD, TH } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatHours, formatPct, formatRs } from '../../utils/format';
import { normaliseWeights } from '../../utils/module5Optimization';
import { PipelineIssueNotice } from '../../components/PipelineIssueNotice';

export function ModuleOptimizationPage() {
  const { result, weights, setWeights, preferences, markCompleted } = usePlannerStore();

  useEffect(() => {
    if (result) markCompleted('optimization');
  }, [result, markCompleted]);

  if (!result) return <EmptyPipelineState moduleName="Module 5 – Overall Travel Optimization" />;

  const normalised = normaliseWeights(weights);
  const recommended = result.plans.find((p) => p.id === result.recommendedPlanId);

  return (
    <div>
      <ModuleHeader
        moduleTag="STEP 5"
        title="Best Trip Recommendation"
        purpose="Based on your interests, budget and travel time, we’ve found the single best trip option for you from all the plans analysed."
      />

      {result.issue?.kind === 'budget' || result.issue?.kind === 'time' ? (
        <PipelineIssueNotice issue={result.issue} />
      ) : null}



      <div className="mt-6 grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Card>
          <CardHeader
            eyebrow="PERSONALISE YOUR PRIORITIES"
            title="Adjust what matters most to you"
            subtitle="Use the sliders to fine-tune which factors matter most for your ideal trip — no need to re-run anything."
          />
          <CardBody className="space-y-4">
            <RangeField
              id="w-interest"
              label="Interest satisfaction"
              value={weights.interest}
              min={0}
              max={1}
              step={0.05}
              display={formatPct(normalised.interest)}
              onChange={(interest) => setWeights({ ...weights, interest })}
            />
            <RangeField
              id="w-budget"
              label="Budget efficiency"
              value={weights.budget}
              min={0}
              max={1}
              step={0.05}
              display={formatPct(normalised.budget)}
              onChange={(budget) => setWeights({ ...weights, budget })}
            />
            <RangeField
              id="w-travel"
              label="Travel efficiency"
              value={weights.travel}
              min={0}
              max={1}
              step={0.05}
              display={formatPct(normalised.travel)}
              onChange={(travel) => setWeights({ ...weights, travel })}
            />
            <RangeField
              id="w-time"
              label="Time suitability"
              value={weights.time}
              min={0}
              max={1}
              step={0.05}
              display={formatPct(normalised.time)}
              onChange={(time) => setWeights({ ...weights, time })}
            />
            <Button variant="secondary" size="sm" onClick={() => setWeights(DEFAULT_WEIGHTS)}>
              Reset to defaults
            </Button>

          </CardBody>
        </Card>

        <div className="space-y-4">
          {recommended ? (
            <Card className="border-forest-500 ring-1 ring-forest-500">
              <CardBody className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 font-mono text-[11px] text-forest-600">
                    <TrophyIcon className="h-3.5 w-3.5" aria-hidden /> RECOMMENDED PLAN
                  </p>
                  <h2 className="mt-1.5 text-xl font-semibold text-ink">
                    {recommended.label} • {recommended.strategy}
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    {recommended.attractionIds.length} attractions •{' '}
                    {formatRs(recommended.resources.totalCost)} •{' '}
                    {formatHours(recommended.route.totalTravelHours)} travel •{' '}
                    {recommended.resources.daysRequired} days
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular text-3xl font-semibold text-forest-700">
                    {recommended.score ? formatPct(recommended.score.overallScore) : '–'}
                  </p>
                  <p className="text-xs text-ink-muted">overall score</p>
                </div>
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader
              eyebrow="ALL TRIP OPTIONS"
              title="All trip options compared"
              subtitle="Plans that exceed your budget or trip duration are marked as not available."
            />
            <CardBody className="px-0 py-0">
              <TableWrap>
                <thead>
                  <tr>
                    <TH>Plan</TH>
                    <TH align="right">Interest</TH>
                    <TH align="right">Travel time</TH>
                    <TH align="right">Total cost</TH>
                    <TH align="center">Budget status</TH>
                    <TH align="right">Overall score</TH>
                  </tr>
                </thead>
                <tbody>
                  {result.plans.map((plan) => (
                    <tr
                      key={plan.id}
                      className={
                        plan.id === result.recommendedPlanId
                          ? 'bg-forest-50/70'
                          : plan.excluded
                          ? 'bg-alert-50/40'
                          : ''
                      }
                    >
                      <TD>
                        <span className="font-semibold text-ink">{plan.label}</span>
                        <span className="block text-xs text-ink-muted">{plan.rankNote}</span>
                      </TD>
                      <TD align="right" mono>
                        {plan.interestScore}%
                      </TD>
                      <TD align="right" mono>
                        {formatHours(plan.route.totalTravelHours)}
                      </TD>
                      <TD align="right" mono>
                        {formatRs(plan.resources.totalCost)}
                      </TD>
                      <TD align="center">
                        {plan.resources.budgetFeasible ? (
                          <Badge tone="forest">Feasible</Badge>
                        ) : (
                          <Badge tone="alert">Over budget</Badge>
                        )}
                      </TD>
                      <TD align="right">
                        {plan.excluded || !plan.score ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-alert-600">
                            <XCircleIcon className="h-3.5 w-3.5" aria-hidden /> Excluded
                          </span>
                        ) : (
                          <span className="flex items-center justify-end gap-2">
                            <span className="hidden w-20 sm:block">
                              <ProgressBar
                                value={plan.score.overallScore * 100}
                                height={6}
                                tone={plan.id === result.recommendedPlanId ? 'forest' : 'soft'}
                                label="overall score"
                              />
                            </span>
                            <span className="tabular font-semibold text-ink">
                              {formatPct(plan.score.overallScore)}
                            </span>
                          </span>
                        )}
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              eyebrow="SCORE BREAKDOWN"
              title="How each trip option scored"
            />
            <CardBody className="px-0 py-0">
              <TableWrap>
                <thead>
                  <tr>
                    <TH>Plan</TH>
                    <TH align="right">Interest match</TH>
                    <TH align="right">Budget efficiency</TH>
                    <TH align="right">Travel efficiency</TH>
                    <TH align="right">Time suitability</TH>
                    <TH align="right">Overall score</TH>
                  </tr>
                </thead>
                <tbody>
                  {result.plans
                    .filter((plan) => plan.score)
                    .map((plan) => (
                      <tr key={plan.id}>
                        <TD>
                          <span className="font-medium text-ink">{plan.label}</span>
                        </TD>
                        <TD align="right" mono>
                          {formatPct(plan.score?.interestSatisfaction ?? 0)}
                        </TD>
                        <TD align="right" mono>
                          {formatPct(plan.score?.budgetEfficiency ?? 0)}
                        </TD>
                        <TD align="right" mono>
                          {formatPct(plan.score?.travelEfficiency ?? 0)}
                        </TD>
                        <TD align="right" mono>
                          {formatPct(plan.score?.timeSuitability ?? 0)}
                        </TD>
                        <TD align="right" mono className="font-semibold">
                          {formatPct(plan.score?.overallScore ?? 0)}
                        </TD>
                      </tr>
                    ))}
                </tbody>
              </TableWrap>
            </CardBody>
          </Card>
        </div>
      </div>

      <StepNav
        backTo="/resources"
        backLabel="Back to budget"
        nextTo="/itinerary"
        nextLabel="View my itinerary"
      />
    </div>
  );
}

export default ModuleOptimizationPage;

