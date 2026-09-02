'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2Icon } from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { EmptyPipelineState } from '../../components/EmptyPipelineState';
import { IOPanel, ModuleHeader, StepNav } from '../../components/ModuleShell';
import { PlanCard } from '../../components/PlanCard';
import { PlanDetailModal } from '../../components/PlanDetailModal';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { TableWrap, TD, TH } from '../../components/ui/Table';
import { ProgressBar } from '../../components/ui/Metrics';
import { formatHours, formatRs } from '../../utils/format';
import { PipelineIssueNotice } from '../../components/PipelineIssueNotice';

export function ModuleDecisionPage() {
  const { result, preferences, markCompleted } = usePlannerStore();
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    if (result) markCompleted('decision');
  }, [result, markCompleted]);

  if (!result) return <EmptyPipelineState moduleName="Module 4 – Intelligent Decision" />;

  const activeInterests = (Object.keys(preferences.interests) as ('nature' | 'wildlife' | 'culture' | 'adventure')[])
    .map((key) => `${key} ${preferences.interests[key]}`)
    .join(', ');

  return (
    <div>
      <ModuleHeader
        moduleTag="MODULE 4"
        pipelinePosition="Stage 1 of 5 • first intelligent module"
        title="Intelligent Decision & Destination Recommendation"
        purpose="Which groups of exact tourist attractions are suitable for this tourist? Attractions are scored against weighted interests, ranked with a priority queue, then assembled into several distinct candidate plans."
        algorithms={[
          'Weighted Sum Scoring',
          'Priority Queue ranking',
          'Multi-strategy plan assembly'
        ]}
      />

      {result.issue?.kind === 'interest' ? <PipelineIssueNotice issue={result.issue} /> : null}

      <IOPanel
        input={[
          { label: 'Interests', value: activeInterests },
          { label: 'Optional', value: preferences.optionalInterests.join(', ') || '–' },
          { label: 'Budget', value: formatRs(preferences.budget) },
          { label: 'Duration', value: `${preferences.days} days` },
          { label: 'Attraction database', value: `${result.rankedAttractions.length} records` }
        ]}
        processing={[
          'Normalise interest levels (Low 0.15 / Medium 0.5 / High 1.0) into weights that sum to 1.',
          'Score each attraction: I_i (weight * score/5), blended with popularity and duration suitability.',
          'Push all attractions into a priority queue and pop them in descending fit order.',
          'Assemble 5 candidate plans, each optimising a different trade-off (interest, value, geography, coverage, popularity).'
        ]}
        output={[
          { label: 'Candidate plans', value: `${result.plans.length}` },
          {
            label: 'Sites per plan',
            value: `${result.plans[0]?.attractionIds.length ?? 0}`
          },
          {
            label: 'Best preliminary interest',
            value: `${Math.max(...result.plans.map((p) => p.interestScore))}%`
          }
        ]}
        handoff="Exact attraction sets are passed to Module 3, which turns each set into a weighted tourism graph."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          'User preferences analyzed',
          'Attractions scored & ranked',
          `${result.plans.length} candidate plans generated`
        ].map((status) => (
          <p
            key={status}
            className="flex items-center gap-2 rounded-xl border border-forest-200 bg-forest-50 px-3.5 py-2.5 text-sm font-medium text-forest-700"
          >
            <CheckCircle2Icon className="h-4 w-4 shrink-0" aria-hidden />
            {status}
          </p>
        ))}
      </div>

      <section className="mt-8" aria-labelledby="candidates-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="candidates-heading" className="text-xl font-semibold tracking-tight text-ink">
              {result.plans.length} candidate travel plans generated
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              These are candidate destination sets – not routes and not final answers.
            </p>
          </div>
        </div>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.plans.map((plan) => (
            <li key={plan.id} className="h-full">
              <PlanCard plan={plan} onViewDetails={() => setDetailId(plan.id)} />
            </li>
          ))}
        </ul>
      </section>

      <Card className="mt-8">
        <CardHeader
          eyebrow="RANKING DETAIL"
          title="Attraction scoring table"
          subtitle="Priority-queue output over the full attraction database, highest fit first."
        />
        <CardBody className="px-0 py-0">
          <TableWrap>
            <thead>
              <tr>
                <TH>#</TH>
                <TH>Attraction</TH>
                <TH>District</TH>
                <TH align="right">Interest</TH>
                <TH align="right">Fit score</TH>
                <TH align="right">Activity cost</TH>
                <TH align="right">Visit</TH>
                <TH align="right">Popularity</TH>
              </tr>
            </thead>
            <tbody>
              {result.rankedAttractions.slice(0, 12).map((row, index) => (
                <tr key={row.attraction.id} className="hover:bg-canvas">
                  <TD mono className="text-ink-soft">
                    {index + 1}
                  </TD>
                  <TD>
                    <span className="font-medium text-ink">{row.attraction.name}</span>
                  </TD>
                  <TD className="text-ink-muted">{row.attraction.city}</TD>
                  <TD align="right" mono>
                    {Math.round(row.interest * 100)}%
                  </TD>
                  <TD align="right">
                    <span className="flex items-center justify-end gap-2">
                      <span className="hidden w-24 sm:block">
                        <ProgressBar value={row.fit * 100} height={6} label="fit score" />
                      </span>
                      <span className="tabular font-semibold text-ink">
                        {Math.round(row.fit * 100)}
                      </span>
                    </span>
                  </TD>
                  <TD align="right" mono>
                    {formatRs(row.attraction.activityCost)}
                  </TD>
                  <TD align="right" mono>
                    {formatHours(row.attraction.visitDuration)}
                  </TD>
                  <TD align="right" mono className="text-ink-muted">
                    {row.attraction.popularity}
                  </TD>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </CardBody>
      </Card>

      <StepNav
        backTo="/planner"
        backLabel="Back to input"
        nextTo="/network"
        nextLabel="Continue to Network Analysis"
        note="Next: Module 3 builds a weighted graph for each candidate plan."
      />

      <PlanDetailModal
        plan={result.plans.find((p) => p.id === detailId) ?? null}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}

export default ModuleDecisionPage;

