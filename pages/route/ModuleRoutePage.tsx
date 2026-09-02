'use client';

import React, { useEffect } from 'react';
import { TrendingDownIcon } from 'lucide-react';
import { getPoint } from '../../lib/data/attractions';
import { usePlannerStore } from '../../store/usePlannerStore';
import { EmptyPipelineState } from '../../components/EmptyPipelineState';
import { IOPanel, ModuleHeader, StepNav } from '../../components/ModuleShell';
import { NetworkGraph } from '../../components/NetworkGraph';
import { PlanSelector } from '../../components/PlanSelector';
import { RouteTimeline } from '../../components/RouteTimeline';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { StatTile } from '../../components/ui/Metrics';
import { TableWrap, TD, TH } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { formatHours, formatKm, formatRs } from '../../utils/format';

export function ModuleRoutePage() {
  const { result, activePlanId, setActivePlanId, preferences, markCompleted } = usePlannerStore();

  useEffect(() => {
    if (result) markCompleted('route');
  }, [result, markCompleted]);

  if (!result) return <EmptyPipelineState moduleName="Module 1 – Route Optimization" />;

  const plan = result.plans.find((p) => p.id === activePlanId) ?? result.plans[0];

  return (
    <div>
      <ModuleHeader
        moduleTag="MODULE 1"
        pipelinePosition="Stage 3 of 5 • after Module 3"
        title="Route Optimization"
        purpose="For each candidate destination plan, what is the best order in which to visit the attractions? Module 1 works strictly inside a single plan – it never compares one plan against another."
        algorithms={[
          'Dijkstra (priority queue)',
          'TSP-style optimisation',
          'Nearest Neighbour heuristic',
          '2-opt improvement'
        ]}
      />

      <IOPanel
        input={[
          { label: 'Weighted graphs', value: `${result.plans.length} (one per plan)` },
          { label: 'Start', value: getPoint(preferences.startHubId).name },
          { label: 'End', value: getPoint(preferences.endHubId).name },
          { label: 'Transport', value: preferences.transport },
          { label: 'Daily travel cap', value: `${preferences.maxDailyTravelHours}h` }
        ]}
        processing={[
          'Run Dijkstra from every node over the adjacency list to build an all-pairs shortest-path matrix.',
          'Construct a starting tour with the Nearest Neighbour heuristic, pinning the start and end hubs.',
          'Apply 2-opt segment reversals until no shorter tour is found.',
          'Score each candidate order on total distance, travel time and transport cost.'
        ]}
        output={[
          { label: 'Best routes', value: `${result.plans.length}` },
          { label: 'This plan distance', value: formatKm(plan.route.totalDistanceKm) },
          { label: 'This plan travel time', value: formatHours(plan.route.totalTravelHours) },
          { label: 'This plan transport cost', value: formatRs(plan.route.totalTravelCost) }
        ]}
        handoff="One best route per candidate plan – with distance, time and transport cost – is passed to Module 2 for resource allocation."
      />

      <Card className="mt-6">
        <CardHeader
          eyebrow="OUTPUT SUMMARY"
          title="Best route per candidate plan"
          subtitle="Module 5 will later use these totals; Module 1 makes no plan-level choice."
        />
        <CardBody className="px-0 py-0">
          <TableWrap>
            <thead>
              <tr>
                <TH>Plan</TH>
                <TH>Best route</TH>
                <TH align="right">Distance</TH>
                <TH align="right">Travel time</TH>
                <TH align="right">Travel cost</TH>
                <TH>Method</TH>
              </tr>
            </thead>
            <tbody>
              {result.plans.map((row) => (
                <tr
                  key={row.id}
                  className={`cursor-pointer hover:bg-canvas ${
                    row.id === plan.id ? 'bg-forest-50/60' : ''
                  }`}
                  onClick={() => setActivePlanId(row.id)}
                >
                  <TD>
                    <span className="font-semibold text-ink">{row.label}</span>
                  </TD>
                  <TD className="text-xs text-ink-muted">
                    {row.route.order.map((id) => getPoint(id).city).join(' → ')}
                  </TD>
                  <TD align="right" mono>
                    {formatKm(row.route.totalDistanceKm)}
                  </TD>
                  <TD align="right" mono>
                    {formatHours(row.route.totalTravelHours)}
                  </TD>
                  <TD align="right" mono>
                    {formatRs(row.route.totalTravelCost)}
                  </TD>
                  <TD className="text-xs text-ink-muted">{row.route.method}</TD>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </CardBody>
      </Card>

      <div className="mt-6">
        <PlanSelector
          plans={result.plans}
          activePlanId={plan.id}
          onSelect={setActivePlanId}
          label="Inspect route optimisation for a plan"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Card>
          <CardHeader
            eyebrow={`${plan.label} BEST ROUTE`}
            title="Optimised visiting order"
            right={<Badge tone="forest">{plan.route.label}</Badge>}
          />
          <CardBody>
            <RouteTimeline order={plan.route.order} legs={plan.route.legs} />
            <div className="grid grid-cols-3 gap-2 border-t border-line pt-4">
              <StatTile label="Distance" value={formatKm(plan.route.totalDistanceKm)} />
              <StatTile label="Travel" value={formatHours(plan.route.totalTravelHours)} />
              <StatTile label="Cost" value={formatRs(plan.route.totalTravelCost)} />
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              eyebrow="CANDIDATE ORDERS"
              title="Visiting orders evaluated inside this plan"
              subtitle="The shortest total distance wins; ties fall back to the earlier method."
              right={
                plan.route.improvementKm > 0 ? (
                  <Badge tone="clay">
                    <TrendingDownIcon className="h-3 w-3" aria-hidden />
                    2-opt saved {formatKm(plan.route.improvementKm)}
                  </Badge>
                ) : null
              }
            />
            <CardBody className="px-0 py-0">
              <TableWrap>
                <thead>
                  <tr>
                    <TH>Route</TH>
                    <TH>Order</TH>
                    <TH align="right">Distance</TH>
                    <TH align="right">Time</TH>
                    <TH align="right">Cost</TH>
                    <TH align="center">Selected</TH>
                  </tr>
                </thead>
                <tbody>
                  {plan.route.candidates.map((candidate) => {
                    const isBest = candidate.order.join('>') === plan.route.order.join('>');
                    return (
                      <tr key={candidate.label} className={isBest ? 'bg-forest-50/60' : ''}>
                        <TD>
                          <span className="font-semibold text-ink">{candidate.label}</span>
                          <span className="block text-xs text-ink-muted">{candidate.method}</span>
                        </TD>
                        <TD className="text-xs text-ink-muted">
                          {candidate.order.map((id) => getPoint(id).city).join(' → ')}
                        </TD>
                        <TD align="right" mono>
                          {formatKm(candidate.totalDistanceKm)}
                        </TD>
                        <TD align="right" mono>
                          {formatHours(candidate.totalTravelHours)}
                        </TD>
                        <TD align="right" mono>
                          {formatRs(candidate.totalTravelCost)}
                        </TD>
                        <TD align="center">{isBest ? <Badge tone="forest">Best</Badge> : null}</TD>
                      </tr>
                    );
                  })}
                </tbody>
              </TableWrap>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              eyebrow="ROUTE ON NETWORK"
              title="Selected path over the Module 3 graph"
              subtitle="Solid dark edges are the chosen tour; dashed edges were available but unused."
            />
            <CardBody>
              <NetworkGraph
                network={plan.network}
                selectedEdgeId={null}
                onSelectEdge={() => undefined}
                routeOrder={plan.route.order}
              />
            </CardBody>
          </Card>
        </div>
      </div>

      <StepNav
        backTo="/network"
        backLabel="Back to Module 3"
        nextTo="/resources"
        nextLabel="Continue to Resource Allocation"
        note="Next: Module 2 tests each route against budget and time resources."
      />
    </div>
  );
}

export default ModuleRoutePage;

