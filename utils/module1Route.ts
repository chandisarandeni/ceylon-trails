import {
  OptimizedRoute,
  PlanNetwork,
  RouteCandidate,
  RouteLeg,
  UserPreferences
} from '../types/tourism';
import { Adjacency, buildAdjacency } from './module3Network';
import { PriorityQueue } from './priorityQueue';

interface ShortestPath {
  distanceKm: number;
  travelHours: number;
  travelCost: number;
  transport: string;
  path: string[];
}

/** Dijkstra over the weighted adjacency list, minimising road distance. */
export function dijkstra(source: string, adjacency: Adjacency): Record<string, ShortestPath> {
  const dist: Record<string, ShortestPath> = {
    [source]: { distanceKm: 0, travelHours: 0, travelCost: 0, transport: '–', path: [source] }
  };
  const settled = new Set<string>();
  const queue = new PriorityQueue<string>();
  queue.push(0, source);

  while (queue.size > 0) {
    const next = queue.pop();
    if (!next) break;
    const node = next.value;
    if (settled.has(node)) continue;
    settled.add(node);
    const current = dist[node];
    (adjacency[node] ?? []).forEach((edge) => {
      const neighbour = edge.from === node ? edge.to : edge.from;
      const candidate: ShortestPath = {
        distanceKm: current.distanceKm + edge.distanceKm,
        travelHours: current.travelHours + edge.travelHours,
        travelCost: current.travelCost + edge.travelCost,
        transport: edge.transport,
        path: [...current.path, neighbour]
      };
      if (!dist[neighbour] || candidate.distanceKm < dist[neighbour].distanceKm) {
        dist[neighbour] = candidate;
        queue.push(candidate.distanceKm, neighbour);
      }
    });
  }
  return dist;
}

function totals(
  order: string[],
  matrix: Record<string, Record<string, ShortestPath>>
): { totalDistanceKm: number; totalTravelHours: number; totalTravelCost: number } {
  let totalDistanceKm = 0;
  let totalTravelHours = 0;
  let totalTravelCost = 0;
  for (let i = 0; i < order.length - 1; i += 1) {
    const leg = matrix[order[i]]?.[order[i + 1]];
    if (!leg) continue;
    totalDistanceKm += leg.distanceKm;
    totalTravelHours += leg.travelHours;
    totalTravelCost += leg.travelCost;
  }
  return {
    totalDistanceKm: Math.round(totalDistanceKm),
    totalTravelHours: Math.round(totalTravelHours * 10) / 10,
    totalTravelCost: Math.round(totalTravelCost)
  };
}

function nearestNeighbour(
  start: string,
  end: string,
  stops: string[],
  matrix: Record<string, Record<string, ShortestPath>>
): string[] {
  const remaining = [...stops];
  const order = [start];
  let current = start;
  while (remaining.length) {
    let bestIndex = 0;
    let bestDistance = Infinity;
    remaining.forEach((candidate, index) => {
      const d = matrix[current]?.[candidate]?.distanceKm ?? Infinity;
      if (d < bestDistance) {
        bestDistance = d;
        bestIndex = index;
      }
    });
    current = remaining.splice(bestIndex, 1)[0];
    order.push(current);
  }
  order.push(end);
  return order;
}

/** 2-opt improvement on the interior of the tour (start/end are pinned). */
function twoOpt(
  order: string[],
  matrix: Record<string, Record<string, ShortestPath>>
): string[] {
  let best = [...order];
  let improved = true;
  let guard = 0;
  while (improved && guard < 60) {
    improved = false;
    guard += 1;
    for (let i = 1; i < best.length - 2; i += 1) {
      for (let k = i + 1; k < best.length - 1; k += 1) {
        const candidate = [
          ...best.slice(0, i),
          ...best.slice(i, k + 1).reverse(),
          ...best.slice(k + 1)
        ];

        if (totals(candidate, matrix).totalDistanceKm < totals(best, matrix).totalDistanceKm) {
          best = candidate;
          improved = true;
        }
      }
    }
  }
  return best;
}

/**
 * MODULE 1 – best visiting order INSIDE one candidate plan.
 * Does not compare candidate plans against each other.
 */
export function optimizeRoute(
  network: PlanNetwork,
  attractionIds: string[],
  prefs: UserPreferences
): OptimizedRoute {
  const adjacency = buildAdjacency(network.nodeIds, network.edges);
  const matrix: Record<string, Record<string, ShortestPath>> = {};
  network.nodeIds.forEach((id) => (matrix[id] = dijkstra(id, adjacency)));

  const start = prefs.startHubId;
  const end = prefs.endHubId;
  const stops = attractionIds.filter((id) => id !== start && id !== end);

  const nnOrder = nearestNeighbour(start, end, stops, matrix);
  const optimisedOrder = twoOpt(nnOrder, matrix);
  const reversedOrder = [start, ...[...stops].reverse(), end];
  const inputOrder = [start, ...stops, end];

  const build = (label: string, method: string, order: string[]): RouteCandidate => ({
    label,
    method,
    order,
    ...totals(order, matrix)
  });

  const candidates: RouteCandidate[] = [
    build('Route A', 'Plan order (unoptimised baseline)', inputOrder),
    build('Route B', 'Nearest Neighbour heuristic', nnOrder),
    build('Route C', 'Nearest Neighbour + 2-opt', optimisedOrder),
    build('Route D', 'Reverse plan order', reversedOrder)
  ].filter(
    (candidate, index, all) =>
      all.findIndex((c) => c.order.join('>') === candidate.order.join('>')) === index
  );

  const best = candidates.reduce((a, b) => (b.totalDistanceKm < a.totalDistanceKm ? b : a));

  const legs: RouteLeg[] = [];
  for (let i = 0; i < best.order.length - 1; i += 1) {
    const from = best.order[i];
    const to = best.order[i + 1];
    const path = matrix[from]?.[to];
    if (!path) continue;
    legs.push({
      from,
      to,
      distanceKm: Math.round(path.distanceKm),
      travelHours: Math.round(path.travelHours * 10) / 10,
      travelCost: Math.round(path.travelCost),
      transport: path.transport,
      via: path.path.slice(1, -1)
    });
  }

  const baseline = candidates.find((c) => c.method.startsWith('Nearest Neighbour heuristic'));

  return {
    ...best,
    legs,
    candidates,
    improvementKm: baseline ? Math.max(0, baseline.totalDistanceKm - best.totalDistanceKm) : 0
  };
}
