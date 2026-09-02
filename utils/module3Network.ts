import { NetworkEdge, PlanNetwork, UserPreferences } from '../types/tourism';
import { edgeCost } from './geo';

const NEAREST_K = 3;

function edgeKey(a: string, b: string): string {
  return [a, b].sort().join('__');
}

/**
 * MODULE 3 – build a weighted, undirected tourism graph for one candidate plan.
 * Nodes = exact attractions + start/end hubs. Edges = viable travel connections.
 */
export function buildPlanNetwork(
  attractionIds: string[],
  prefs: UserPreferences
): PlanNetwork {
  const nodeIds = Array.from(new Set([prefs.startHubId, ...attractionIds, prefs.endHubId]));
  const edgeMap = new Map<string, NetworkEdge>();

  const addEdge = (from: string, to: string) => {
    if (from === to) return;
    const key = edgeKey(from, to);
    if (edgeMap.has(key)) return;
    const cost = edgeCost(from, to, prefs.transport);
    edgeMap.set(key, { id: key, from, to, ...cost });
  };

  // k-nearest-neighbour edges keep the graph sparse and readable.
  nodeIds.forEach((from) => {
    const neighbours = nodeIds
      .filter((to) => to !== from)
      .map((to) => ({ to, distanceKm: edgeCost(from, to, prefs.transport).distanceKm }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, NEAREST_K);
    neighbours.forEach((n) => addEdge(from, n.to));
  });

  // Union-find pass: add shortest remaining edges until the graph is connected.
  const parent: Record<string, string> = {};
  nodeIds.forEach((id) => (parent[id] = id));
  const find = (x: string): string => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };
  Array.from(edgeMap.values()).forEach((e) => union(e.from, e.to));

  const allPairs: { from: string; to: string; distanceKm: number }[] = [];
  nodeIds.forEach((from, i) =>
    nodeIds.slice(i + 1).forEach((to) => {
      allPairs.push({ from, to, distanceKm: edgeCost(from, to, prefs.transport).distanceKm });
    })
  );
  allPairs
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .forEach((pair) => {
      if (find(pair.from) !== find(pair.to)) {
        addEdge(pair.from, pair.to);
        union(pair.from, pair.to);
      }
    });

  const edges = Array.from(edgeMap.values());

  const adjacency = buildAdjacency(nodeIds, edges);
  const degrees: Record<string, number> = {};
  nodeIds.forEach((id) => (degrees[id] = adjacency[id]?.length ?? 0));

  const mostConnectedId = nodeIds.reduce(
    (best, id) => (degrees[id] > degrees[best] ? id : best),
    nodeIds[0]
  );
  const avgDistanceKm =
    edges.reduce((sum, e) => sum + e.distanceKm, 0) / Math.max(edges.length, 1);

  return {
    nodeIds,
    edges,
    degrees,
    mostConnectedId,
    avgDistanceKm,
    componentCount: countComponents(nodeIds, adjacency),
    bfsOrder: bfs(prefs.startHubId, adjacency),
    dfsOrder: dfs(prefs.startHubId, adjacency),
    remoteEdges: [...edges]
      .filter((e) => e.distanceKm > avgDistanceKm * 1.25)
      .sort((a, b) => b.distanceKm - a.distanceKm)
      .slice(0, 3)
  };
}

export type Adjacency = Record<string, NetworkEdge[]>;

export function buildAdjacency(nodeIds: string[], edges: NetworkEdge[]): Adjacency {
  const adjacency: Adjacency = {};
  nodeIds.forEach((id) => (adjacency[id] = []));
  edges.forEach((edge) => {
    adjacency[edge.from]?.push(edge);
    adjacency[edge.to]?.push(edge);
  });
  return adjacency;
}

function other(edge: NetworkEdge, node: string): string {
  return edge.from === node ? edge.to : edge.from;
}

export function bfs(start: string, adjacency: Adjacency): string[] {
  const visited = new Set<string>([start]);
  const order: string[] = [];
  const queue: string[] = [start];
  while (queue.length) {
    const node = queue.shift() as string;
    order.push(node);
    (adjacency[node] ?? [])
      .slice()
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .forEach((edge) => {
        const next = other(edge, node);
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      });
  }
  return order;
}

export function dfs(start: string, adjacency: Adjacency): string[] {
  const visited = new Set<string>();
  const order: string[] = [];
  const walk = (node: string) => {
    if (visited.has(node)) return;
    visited.add(node);
    order.push(node);
    (adjacency[node] ?? [])
      .slice()
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .forEach((edge) => walk(other(edge, node)));
  };
  walk(start);
  return order;
}

function countComponents(nodeIds: string[], adjacency: Adjacency): number {
  const visited = new Set<string>();
  let count = 0;
  nodeIds.forEach((id) => {
    if (visited.has(id)) return;
    count += 1;
    bfs(id, adjacency).forEach((n) => visited.add(n));
  });
  return count;
}
