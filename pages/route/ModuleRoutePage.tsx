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
        moduleTag="STEP 3"
        title="Best Route for Each Trip Option"
        purpose="We've calculated the most efficient visiting order for each of your trip options — minimising travel time and distance so you spend more time enjoying Sri Lanka."
      />



      <Card className="mt-6">
        <CardHeader
          eyebrow="ROUTE SUMMARY"
          title="Best visiting order per trip option"
          subtitle="Comparing the travel time and cost for each trip option to help you choose."
        />
        <CardBody className="px-0 py-0">
          <TableWrap>
            <thead>
              <tr>
                <TH>Plan</TH>
                <TH>Destinations order</TH>
                <TH align="right">Distance</TH>
                <TH align="right">Travel time</TH>
                <TH align="right">Travel cost</TH>
                <TH>Route type</TH>
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
          label="Explore route details for a trip option"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Card>
          <CardHeader
            eyebrow={`${plan.label} BEST ROUTE`}
            title="Recommended visiting order"
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
              eyebrow="ROUTE OPTIONS COMPARED"
              title="Route options compared"
              subtitle="The shortest and most efficient route is selected for your trip."
              right={
                plan.route.improvementKm > 0 ? (
                  <Badge tone="clay">
                    <TrendingDownIcon className="h-3 w-3" aria-hidden />
                    Saved {formatKm(plan.route.improvementKm)}
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
              eyebrow="MAP VIEW"
              title="Your trip route on the map"
              subtitle="The highlighted path shows your planned journey. Dashed lines are available but not selected connections."
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
        backLabel="Back to connections"
        nextTo="/resources"
        nextLabel="See budget breakdown"
      />
    </div>
  );
}

export default ModuleRoutePage;

