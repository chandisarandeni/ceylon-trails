'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2Icon } from 'lucide-react';
import { usePlannerStore } from '../../store/usePlannerStore';
import { EmptyPipelineState } from '../../components/EmptyPipelineState';
import { ModuleHeader, StepNav } from '../../components/ModuleShell';
import { PlanCard } from '../../components/PlanCard';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { TableWrap, TD, TH } from '../../components/ui/Table';
import { ProgressBar } from '../../components/ui/Metrics';
import { formatHours, formatRs } from '../../utils/format';
import { PipelineIssueNotice } from '../../components/PipelineIssueNotice';

export function ModuleDecisionPage() {
  const { result, preferences, markCompleted } = usePlannerStore();

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
        moduleTag="STEP 1"
        title="Destination Matching"
        purpose="Based on your interests and preferences, we've identified the best Sri Lanka attractions for you and grouped them into multiple trip options to choose from."
      />

      {result.issue?.kind === 'interest' ? <PipelineIssueNotice issue={result.issue} /> : null}



      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          'Your interests analysed',
          'Best attractions identified',
          `${result.plans.length} trip options ready`
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
              {result.plans.length} personalised trip options for you
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Each option features a unique set of destinations selected to match your interests. Browse and compare them below.
            </p>
          </div>
        </div>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.plans.map((plan) => (
            <li key={plan.id} className="h-full">
              <PlanCard plan={plan} />
            </li>
          ))}
        </ul>
      </section>

      <Card className="mt-8">
        <CardHeader
          eyebrow="TOP ATTRACTIONS FOR YOU"
          title="Best matched attractions"
          subtitle="Ranked by how well they match your personal interests and travel preferences."
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
        backLabel="Edit my preferences"
        nextTo="/network"
        nextLabel="See route connections"
      />
    </div>
  );
}

export default ModuleDecisionPage;

