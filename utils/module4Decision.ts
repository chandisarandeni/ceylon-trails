import { ATTRACTIONS } from '../lib/data/attractions';
import {
  Attraction,
  InterestLevel,
  ScoreKey,
  UserPreferences
} from '../types/tourism';
import { roadDistanceKm } from './geo';
import { PriorityQueue } from './priorityQueue';
import { clamp } from './format';

const LEVEL_WEIGHT: Record<InterestLevel, number> = { Low: 0.15, Medium: 0.5, High: 1 };
const OPTIONAL_WEIGHT = 0.45;

export interface ScoredAttraction {
  attraction: Attraction;
  interest: number;
  fit: number;
  valuePerRupee: number;
}

export interface CandidateDraft {
  label: string;
  strategy: string;
  strategyNote: string;
  attractionIds: string[];
  interestScore: number;
  rawInterest: number;
  activityCost: number;
  visitDurationHours: number;
  matchReasons: string[];
}

export function interestWeights(prefs: UserPreferences): Partial<Record<ScoreKey, number>> {
  const weights: Partial<Record<ScoreKey, number>> = {};
  (Object.keys(prefs.interests) as ScoreKey[]).forEach((key) => {
    weights[key] = LEVEL_WEIGHT[prefs.interests[key]];
  });
  if (prefs.optionalInterests) {
    prefs.optionalInterests.forEach((key) => {
      weights[key] = OPTIONAL_WEIGHT;
    });
  }
  const total = Object.values(weights).reduce((sum, w) => sum + (w ?? 0), 0) || 1;
  (Object.keys(weights) as ScoreKey[]).forEach((key) => {
    weights[key] = (weights[key] as number) / total;
  });
  return weights;
}

/** Weighted-sum interest model, blended with popularity and duration suitability. */
export function scoreAttractions(prefs: UserPreferences): ScoredAttraction[] {
  const weights = interestWeights(prefs);
  const scored = ATTRACTIONS.map((attraction) => {
    let interest = 0;
    (Object.keys(weights) as ScoreKey[]).forEach((key) => {
      interest += (weights[key] as number) * (attraction.scores[key] / 5);
    });
    const durationFit =
      attraction.visitDuration > prefs.days * 1.5 ? 0.75 : attraction.visitDuration > 7 ? 0.9 : 1;
    const fit = clamp(
      (0.82 * interest + 0.18 * (attraction.popularity / 100)) * durationFit,
      0,
      1
    );
    return {
      attraction,
      interest,
      fit,
      valuePerRupee: fit / ((attraction.activityCost + 2500) / 1000)
    };
  });

  // Rank with a priority queue (max-heap via negated keys).
  const queue = new PriorityQueue<ScoredAttraction>();
  scored.forEach((item) => queue.push(-item.fit, item));
  const ranked: ScoredAttraction[] = [];
  while (queue.size > 0) {
    const next = queue.pop();
    if (next) ranked.push(next.value);
  }
  return ranked;
}

function planSize(prefs: UserPreferences): number {
  const suggested = Math.round(prefs.days * 0.85);
  const cap = prefs.maxDestinations && prefs.maxDestinations > 0 ? prefs.maxDestinations : Math.max(suggested, 15);
  return clamp(suggested, 3, cap);
}

function summarise(
  ids: string[],
  ranked: ScoredAttraction[],
  prefs: UserPreferences
): Omit<CandidateDraft, 'label' | 'strategy' | 'strategyNote' | 'matchReasons'> {
  const items = ids
    .map((id) => ranked.find((r) => r.attraction.id === id))
    .filter(Boolean) as ScoredAttraction[];
  const rawInterest = items.reduce((sum, i) => sum + i.interest, 0) / Math.max(items.length, 1);
  const coverageKeys = (Object.keys(prefs.interests) as ScoreKey[]).filter(
    (k) => prefs.interests[k] === 'High'
  );
  const covered = coverageKeys.filter((key) =>
    items.some((i) => i.attraction.scores[key] >= 4)
  ).length;
  const coverageBonus = coverageKeys.length ? (covered / coverageKeys.length) * 8 : 0;
  const interestScore = clamp(
    Math.round((items.reduce((sum, i) => sum + i.fit, 0) / Math.max(items.length, 1)) * 100 + coverageBonus),
    0,
    100
  );
  return {
    attractionIds: ids,
    interestScore,
    rawInterest,
    activityCost: items.reduce((sum, i) => sum + i.attraction.activityCost, 0),
    visitDurationHours: items.reduce((sum, i) => sum + i.attraction.visitDuration, 0)
  };
}

function reasonsFor(ids: string[], ranked: ScoredAttraction[], prefs: UserPreferences): string[] {
  const items = ids
    .map((id) => ranked.find((r) => r.attraction.id === id))
    .filter(Boolean) as ScoredAttraction[];
  const reasons: string[] = [];
  (Object.keys(prefs.interests) as ScoreKey[]).forEach((key) => {
    if (prefs.interests[key] === 'Low') return;
    const hits = items.filter((i) => i.attraction.scores[key] >= 4);
    if (hits.length) {
      reasons.push(
        `${hits.length} strong ${key} site${hits.length > 1 ? 's' : ''} (${hits
          .map((h) => h.attraction.city)
          .join(', ')})`
      );
    }
  });
  if (prefs.optionalInterests) {
    prefs.optionalInterests.forEach((key) => {
      const hits = items.filter((i) => i.attraction.scores[key] >= 4);
      if (hits.length) reasons.push(`Covers your optional ${key} preference`);
    });
  }
  const cost = items.reduce((sum, i) => sum + i.attraction.activityCost, 0);
  reasons.push(`Activity spend of Rs.${cost.toLocaleString('en-US')} across ${items.length} sites`);
  const provinces = new Set(items.map((i) => i.attraction.province));
  reasons.push(`Spans ${provinces.size} province${provinces.size > 1 ? 's' : ''}`);
  return reasons;
}

/**
 * MODULE 4 – produces multiple candidate destination plans (exact attractions).
 * Each strategy optimises a different trade-off so downstream modules see real variety.
 */
export function generateCandidatePlans(prefs: UserPreferences): {
  ranked: ScoredAttraction[];
  drafts: CandidateDraft[];
} {
  const ranked = scoreAttractions(prefs);
  const usable = ranked.filter((r) => r.fit > 0.12);
  const pool = usable.length >= 4 ? usable : ranked.slice(0, 8);
  const n = planSize(prefs);

  const strategies: { label: string; strategy: string; note: string; pick: () => string[] }[] = [
    {
      label: 'Plan 1',
      strategy: 'Top Interest Match',
      note: 'Highest weighted interest score, cost ignored at this stage.',
      pick: () => pool.slice(0, n).map((r) => r.attraction.id)
    },
    {
      label: 'Plan 2',
      strategy: 'Value Optimised',
      note: 'Ranked by interest earned per rupee of activity cost.',
      pick: () =>
        [...pool]
          .sort((a, b) => b.valuePerRupee - a.valuePerRupee)
          .slice(0, n)
          .map((r) => r.attraction.id)
    },
    {
      label: 'Plan 3',
      strategy: 'Compact Region',
      note: 'Seeded with the best match, then geographically nearest strong matches.',
      pick: () => {
        const seed = pool[0];
        const rest = [...pool.slice(1)]
          .sort(
            (a, b) =>
              roadDistanceKm(seed.attraction.id, a.attraction.id) -
              roadDistanceKm(seed.attraction.id, b.attraction.id)
          )
          .filter((r) => r.fit > 0.25);
        return [seed.attraction.id, ...rest.slice(0, n - 1).map((r) => r.attraction.id)];
      }
    },
    {
      label: 'Plan 4',
      strategy: 'Balanced Coverage',
      note: 'One best-in-class site per weighted interest, then filled by rank.',
      pick: () => {
        const keys = (Object.keys(prefs.interests) as ScoreKey[])
          .filter((k) => prefs.interests[k] !== 'Low')
          .sort((a, b) => (prefs.interests[b] === 'High' ? 1 : 0) - (prefs.interests[a] === 'High' ? 1 : 0));
        const chosen: string[] = [];
        const allKeys: ScoreKey[] = [...keys, ...(prefs.optionalInterests || [])];
        allKeys.forEach((key) => {
          const best = pool.find(
            (r) => !chosen.includes(r.attraction.id) && r.attraction.scores[key] >= 4
          );
          if (best && chosen.length < n) chosen.push(best.attraction.id);
        });
        pool.forEach((r) => {
          if (chosen.length < n && !chosen.includes(r.attraction.id)) chosen.push(r.attraction.id);
        });
        return chosen.slice(0, n);
      }
    },
    {
      label: 'Plan 5',
      strategy: 'Signature Highlights',
      note: 'Popularity-weighted mix of the island’s best-known sites.',
      pick: () =>
        [...pool]
          .sort(
            (a, b) =>
              0.5 * b.fit +
              0.5 * (b.attraction.popularity / 100) -
              (0.5 * a.fit + 0.5 * (a.attraction.popularity / 100))
          )
          .slice(0, n)
          .map((r) => r.attraction.id)
    }
  ];

  const seen = new Set<string>();
  const drafts: CandidateDraft[] = [];

  strategies.forEach((strategy) => {
    let ids = Array.from(new Set(strategy.pick()));
    // Guarantee distinct candidate plans so downstream modules produce different results.
    let guard = 0;
    while (seen.has([...ids].sort().join('|')) && guard < pool.length) {
      const replacement = pool.find((r) => !ids.includes(r.attraction.id));
      if (!replacement) break;
      ids = [...ids.slice(0, Math.max(1, ids.length - 1)), replacement.attraction.id];
      guard += 1;
    }
    if (ids.length < 2) return;
    seen.add([...ids].sort().join('|'));
    drafts.push({
      label: strategy.label,
      strategy: strategy.strategy,
      strategyNote: strategy.note,
      matchReasons: reasonsFor(ids, ranked, prefs),
      ...summarise(ids, ranked, prefs)
    });
  });

  return { ranked, drafts };
}
