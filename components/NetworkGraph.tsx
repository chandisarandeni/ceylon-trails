import React from 'react';
import { getPoint } from '../lib/data/attractions';
import { NetworkEdge, PlanNetwork } from '../types/tourism';
import { projectPoints } from '../utils/geo';

const WIDTH = 660;
const HEIGHT = 540;

export function NetworkGraph({
  network,
  selectedEdgeId,
  onSelectEdge,
  routeOrder
}: {
  network: PlanNetwork;
  selectedEdgeId: string | null;
  onSelectEdge: (edge: NetworkEdge) => void;
  routeOrder?: string[];
}) {
  const points = network.nodeIds.map((id) => getPoint(id));
  const positions = projectPoints(points, WIDTH, HEIGHT);
  const maxDegree = Math.max(...Object.values(network.degrees), 1);

  const routeEdgeKeys = new Set(
    (routeOrder ?? []).slice(0, -1).map((id, i) => [id, (routeOrder ?? [])[i + 1]].sort().join('__'))
  );

  return (
    <div className="map-grid rounded-2xl border border-line bg-surface">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="group"
        aria-label="Tourism network graph for the selected candidate plan"
      >
        {network.edges.map((edge) => {
          const a = positions[edge.from];
          const b = positions[edge.to];
          if (!a || !b) return null;
          const isSelected = edge.id === selectedEdgeId;
          const onRoute = routeEdgeKeys.has(edge.id);
          return (
            <g key={edge.id}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={isSelected ? '#D2762F' : onRoute ? '#1F6247' : '#B0D4C1'}
                strokeWidth={isSelected ? 3.5 : onRoute ? 2.6 : 1.6}
                strokeDasharray={onRoute || isSelected ? undefined : '5 5'}
              />
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="transparent"
                strokeWidth={16}
                className="cursor-pointer"
                onClick={() => onSelectEdge(edge)}
                role="button"
                tabIndex={0}
                aria-label={`Connection ${getPoint(edge.from).name} to ${getPoint(edge.to).name}`}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') onSelectEdge(edge);
                }}
              />
              <text
                x={(a.x + b.x) / 2}
                y={(a.y + b.y) / 2 - 5}
                textAnchor="middle"
                className="pointer-events-none select-none"
                fontSize={10}
                fontFamily="IBM Plex Mono, monospace"
                fill={isSelected ? '#B05C1F' : '#8B9A92'}
              >
                {Math.round(edge.distanceKm)}km
              </text>
            </g>
          );
        })}

        {network.nodeIds.map((id) => {
          const pos = positions[id];
          const point = getPoint(id);
          if (!pos) return null;
          const degree = network.degrees[id] ?? 0;
          const radius = 9 + (degree / maxDegree) * 7;
          const isHub = point.isHub;
          const isMostConnected = id === network.mostConnectedId;
          return (
            <g key={id}>
              {isMostConnected ? (
                <circle cx={pos.x} cy={pos.y} r={radius + 6} fill="#D9EBE1" />
              ) : null}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={radius}
                fill={isHub ? '#0E3527' : '#2E7A5B'}
                stroke="#FFFFFF"
                strokeWidth={2.5}
              />
              <text
                x={pos.x}
                y={pos.y + 3.5}
                textAnchor="middle"
                fontSize={10}
                fontWeight={600}
                fontFamily="IBM Plex Mono, monospace"
                fill="#FFFFFF"
                className="pointer-events-none select-none"
              >
                {degree}
              </text>
              <text
                x={pos.x}
                y={pos.y - radius - 7}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill="#0D1A14"
                className="pointer-events-none select-none"
              >
                {truncate(point.name, 26)}
              </text>
              <text
                x={pos.x}
                y={pos.y + radius + 14}
                textAnchor="middle"
                fontSize={10}
                fill="#576760"
                className="pointer-events-none select-none"
              >
                {point.city}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
