'use client';

import React, { useEffect, useState } from 'react';
import { GitBranchIcon, InfoIcon } from 'lucide-react';
import { getPoint, pointName } from '../../lib/data/attractions';
import { NetworkEdge } from '../../types/tourism';
import { usePlannerStore } from '../../store/usePlannerStore';
import { EmptyPipelineState } from '../../components/EmptyPipelineState';
import { IOPanel, ModuleHeader, StepNav } from '../../components/ModuleShell';
import { NetworkGraph } from '../../components/NetworkGraph';
import { PlanSelector } from '../../components/PlanSelector';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { StatTile } from '../../components/ui/Metrics';
import { TableWrap, TD, TH } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { formatHours, formatKm, formatRs } from '../../utils/format';

export function ModuleNetworkPage() {
  const { result, activePlanId, setActivePlanId, preferences, markCompleted } = usePlannerStore();
  const [selectedEdge, setSelectedEdge] = useState<NetworkEdge | null>(null);

  useEffect(() => {
    if (result) markCompleted('network');
  }, [result, markCompleted]);

  if (!result) return <EmptyPipelineState moduleName="Module 3 – Tourism Network Analysis" />;

  const plan = result.plans.find((p) => p.id === activePlanId) ?? result.plans[0];
  const network = plan.network;

  return (
    <div>
      <ModuleHeader
        moduleTag="MODULE 3"
        pipelinePosition="Stage 2 of 5"
        title="Tourism Network Analysis"
        purpose="How are these destinations connected? Converts candidate attraction sets into weighted, undirected graphs so routing algorithms can reason about distances, travel times, transport modes and node centrality."
        algorithms={[
          'Weighted Graph',
          'Adjacency List',
          'k-Nearest edges + Union-Find connectivity',
          'BFS / DFS traversal',
          'Node degree analysis'
        ]}
      />

      <IOPanel
        input={[
          { label: 'Candidate plans', value: `${result.plans.length}` },
          { label: 'Nodes in this plan', value: `${network.nodeIds.length}` },
          { label: 'Transport mode', value: preferences.transport },
          { label: 'Start / end', value: `${getPoint(preferences.startHubId).city} → ${getPoint(preferences.endHubId).city}` }
        ]}
        processing={[
          'Create one node per exact attraction, plus the start and end hubs.',
          'Add k-nearest-neighbour edges, then union-find repair passes until the graph is fully connected.',
          'Weight every edge with road distance, travel time and transport cost for the chosen mode.',
          'Run BFS and DFS from the start hub and compute node degrees to find hubs and remote links.'
        ]}
        output={[
          { label: 'Connections', value: `${network.edges.length}` },
          { label: 'Most connected', value: pointName(network.mostConnectedId) },
          { label: 'Avg edge distance', value: formatKm(network.avgDistanceKm) },
          { label: 'Components', value: `${network.componentCount} (connected)` }
        ]}
        handoff="The weighted adjacency list for each plan is passed to Module 1, which searches it for the best visiting order."
      />

      <div className="mt-6">
        <PlanSelector
          plans={result.plans}
          activePlanId={plan.id}
          onSelect={setActivePlanId}
          label="Switch candidate plan network"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader
            eyebrow={`${plan.label} NETWORK`}
            title="Weighted tourism graph"
            subtitle="Node labels show degree. Click any connection line to inspect its weights."
            right={
              <Badge tone="neutral" mono>
                {network.nodeIds.length} nodes • {network.edges.length} edges
              </Badge>
            }
          />
          <CardBody>
            <NetworkGraph
              network={network}
              selectedEdgeId={selectedEdge?.id ?? null}
              onSelectEdge={setSelectedEdge}
            />
            <p className="mt-3 flex items-start gap-1.5 text-xs text-ink-muted">
              <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Connectivity is network information only – a highly connected attraction is not
              automatically the best destination.
            </p>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader eyebrow="EDGE INSPECTOR" title="Connection details" />
            <CardBody>
              {selectedEdge ? (
                <dl className="space-y-2.5 text-sm">
                  {[
                    ['From', pointName(selectedEdge.from)],
                    ['To', pointName(selectedEdge.to)],
                    ['Distance', formatKm(selectedEdge.distanceKm)],
                    ['Travel time', formatHours(selectedEdge.travelHours)],
                    ['Transport', selectedEdge.transport],
                    ['Estimated cost', formatRs(selectedEdge.travelCost)]
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-baseline justify-between gap-3">
                      <dt className="text-ink-muted">{label}</dt>
                      <dd className="tabular text-right font-semibold text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-ink-muted">
                  Select a connection in the graph to see its distance, travel time, transport type
                  and cost.
                </p>
              )}
            </CardBody>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Nodes" value={network.nodeIds.length} />
            <StatTile label="Connections" value={network.edges.length} />
            <StatTile
              label="Avg distance"
              value={formatKm(network.avgDistanceKm)}
              hint="Across all edges"
            />
            <StatTile
              label="Max degree"
              value={network.degrees[network.mostConnectedId] ?? 0}
              hint={pointName(network.mostConnectedId)}
              tone="accent"
            />
          </div>

          <Card>
            <CardHeader eyebrow="TRAVERSALS" title="Graph exploration from start hub" />
            <CardBody className="space-y-3 text-sm">
              <div>
                <p className="flex items-center gap-1.5 font-medium text-ink">
                  <GitBranchIcon className="h-3.5 w-3.5 text-forest-600" aria-hidden /> BFS order
                </p>
                <p className="mt-1 font-mono text-xs text-ink-muted">
                  {network.bfsOrder.map((id) => getPoint(id).city).join(' → ')}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 font-medium text-ink">
                  <GitBranchIcon className="h-3.5 w-3.5 text-clay-500" aria-hidden /> DFS order
                </p>
                <p className="mt-1 font-mono text-xs text-ink-muted">
                  {network.dfsOrder.map((id) => getPoint(id).city).join(' → ')}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader
          eyebrow="ADJACENCY LIST"
          title="Edge weights passed downstream"
          subtitle="Every connection carries distance, travel time, transport type and cost."
        />
        <CardBody className="px-0 py-0">
          <TableWrap>
            <thead>
              <tr>
                <TH>From</TH>
                <TH>To</TH>
                <TH align="right">Distance</TH>
                <TH align="right">Travel time</TH>
                <TH>Transport</TH>
                <TH align="right">Cost</TH>
                <TH align="center">Note</TH>
              </tr>
            </thead>
            <tbody>
              {network.edges.map((edge) => {
                const isRemote = network.remoteEdges.some((r) => r.id === edge.id);
                return (
                  <tr
                    key={edge.id}
                    className={`cursor-pointer hover:bg-canvas ${
                      selectedEdge?.id === edge.id ? 'bg-clay-50' : ''
                    }`}
                    onClick={() => setSelectedEdge(edge)}
                  >
                    <TD>{pointName(edge.from)}</TD>
                    <TD>{pointName(edge.to)}</TD>
                    <TD align="right" mono>
                      {formatKm(edge.distanceKm)}
                    </TD>
                    <TD align="right" mono>
                      {formatHours(edge.travelHours)}
                    </TD>
                    <TD className="text-ink-muted">{edge.transport}</TD>
                    <TD align="right" mono>
                      {formatRs(edge.travelCost)}
                    </TD>
                    <TD align="center">
                      {isRemote ? <Badge tone="clay">Remote link</Badge> : null}
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </TableWrap>
        </CardBody>
      </Card>

      <StepNav
        backTo="/decision"
        backLabel="Back to Module 4"
        nextTo="/route"
        nextLabel="Continue to Route Optimization"
        note="Next: Module 1 finds the best visiting order inside each plan."
      />
    </div>
  );
}

export default ModuleNetworkPage;

