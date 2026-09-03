'use client';

import React, { useState } from 'react';
import { HelpCircleIcon } from 'lucide-react';
import { CandidatePlan } from '../../types/tourism';
import { usePlannerStore } from '../../store/usePlannerStore';
import { EmptyPipelineState } from '../../components/EmptyPipelineState';
import { PlanCard } from '../../components/PlanCard';
import { PlanDetailModal } from '../../components/PlanDetailModal';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CompareChart, CompareRow } from '../../components/ui/Metrics';
import { Button } from '../../components/ui/Button';
import { formatHours, formatPct, formatRs, formatRsShort } from '../../utils/format';

export function ComparePlansPage() {
  const { result } = usePlannerStore();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [explainId, setExplainId] = useState<string | null>(null);

  if (!result) return <EmptyPipelineState moduleName="Plan comparison" />;

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
      <header>
        <Badge tone="forest" mono>
          PLAN COMPARISON
        </Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          All candidate plans side by side
        </h1>
        <p className="mt-2 max-w-2xl text-base text-ink-muted">
          Every plan carries its own destinations, route, costs and scores. The selected plan is
          highlighted; excluded plans show exactly which constraint they broke.
        </p>
      </header>

      <Card>
        <CardHeader
          eyebrow="CHARTS"
          title="Candidate plan comparison"
          subtitle="Dark bar = recommended plan. Grey bar = excluded as infeasible."
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
            rows={rows((plan) => ({
              value: plan.interestScore,
              display: `${plan.interestScore}%`
            }))}
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

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {result.plans.map((plan) => (
          <li key={plan.id} className="flex h-full flex-col gap-2">
            <PlanCard
              plan={plan}
              isRecommended={plan.id === result.recommendedPlanId}
              onViewDetails={() => setDetailId(plan.id)}
              showFeasibility
              showOverall
            />
            {plan.id !== result.recommendedPlanId ? (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExplainId(explainId === plan.id ? null : plan.id)}
                >
                  <HelpCircleIcon className="h-3.5 w-3.5" aria-hidden />
                  Why wasn’t this plan selected?
                </Button>
                {explainId === plan.id ? (
                  <p className="mt-1 rounded-xl border border-line bg-surface p-3 text-xs text-ink-muted">
                    {plan.excluded
                      ? plan.exclusionReason
                      : `${plan.rankNote}. Interest ${plan.interestScore}%, total ${formatRs(
                          plan.resources.totalCost
                        )}, travel ${formatHours(plan.route.totalTravelHours)}.`}
                  </p>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <PlanDetailModal
        plan={result.plans.find((p) => p.id === detailId) ?? null}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}

export default ComparePlansPage;

