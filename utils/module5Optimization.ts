import { CandidatePlan, Module5Weights, UserPreferences } from '../types/tourism';

function normalise(values: number[], higherIsBetter: boolean): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max - min < 1e-9) return values.map(() => 1);
  return values.map((v) => {
    const scaled = (v - min) / (max - min);
    return higherIsBetter ? scaled : 1 - scaled;
  });
}

export function normaliseWeights(weights: Module5Weights): Module5Weights {
  const total = weights.interest + weights.budget + weights.travel + weights.time || 1;
  return {
    interest: weights.interest / total,
    budget: weights.budget / total,
    travel: weights.travel / total,
    time: weights.time / total
  };
}

/**
 * MODULE 5 – multi-criteria decision making across complete candidate plans.
 * Infeasible plans are excluded first; remaining plans are scored with a weighted sum model.
 * No routing or resource maths is recomputed here.
 */
export function scorePlans(
  plans: CandidatePlan[],
  prefs: UserPreferences,
  rawWeights: Module5Weights
): { plans: CandidatePlan[]; recommendedPlanId: string | null } {
  const weights = normaliseWeights(rawWeights);

  const evaluated = plans.map((plan) => {
    const reasons: string[] = [];
    if (!plan.resources.budgetFeasible) {
      reasons.push(
        `Total Rs.${plan.resources.totalCost.toLocaleString('en-US')} exceeds the Rs.${prefs.budget.toLocaleString(
          'en-US'
        )} budget`
      );
    }
    if (!plan.resources.timeFeasible) {
      reasons.push(`Requires ${plan.resources.daysRequired} days vs ${prefs.days} available`);
    }
    if (!plan.resources.dailyTravelFeasible) {
      reasons.push(
        `Peak transfer of ${plan.resources.peakDailyTravelHours}h breaks the ${prefs.maxDailyTravelHours}h daily cap`
      );
    }
    return {
      ...plan,
      excluded: reasons.length > 0,
      exclusionReason: reasons.length ? reasons.join(' • ') : null,
      score: null,
      rankNote: ''
    };
  });

  const feasible = evaluated.filter((p) => !p.excluded);
  if (feasible.length === 0) {
    return { plans: evaluated, recommendedPlanId: null };
  }

  const interest = normalise(feasible.map((p) => p.interestScore), true);
  // Budget efficiency: interest earned per rupee actually committed.
  const budget = normalise(
    feasible.map((p) => p.interestScore / Math.max(p.resources.totalCost, 1)),
    true
  );
  const travel = normalise(feasible.map((p) => p.route.totalTravelHours), false);
  const time = normalise(
    feasible.map((p) => Math.abs(prefs.days - p.resources.daysRequired)),
    false
  );

  const scored = feasible.map((plan, i) => {
    const breakdown = {
      interestSatisfaction: interest[i],
      budgetEfficiency: budget[i],
      travelEfficiency: travel[i],
      timeSuitability: time[i],
      overallScore:
        weights.interest * interest[i] +
        weights.budget * budget[i] +
        weights.travel * travel[i] +
        weights.time * time[i]
    };
    return { ...plan, score: breakdown };
  });

  const ordered = [...scored].sort(
    (a, b) => (b.score?.overallScore ?? 0) - (a.score?.overallScore ?? 0)
  );
  const winner = ordered[0];

  const withNotes = evaluated.map((plan) => {
    const match = scored.find((s) => s.id === plan.id);
    if (!match) {
      return { ...plan, rankNote: plan.exclusionReason ?? 'Excluded before scoring' };
    }
    const rank = ordered.findIndex((o) => o.id === plan.id) + 1;
    if (match.id === winner.id) {
      return { ...match, rankNote: 'Highest overall score – recommended' };
    }
    const gap = ((winner.score?.overallScore ?? 0) - (match.score?.overallScore ?? 0)) * 100;
    const weakest = (
      [
        ['interest match', match.score?.interestSatisfaction ?? 0],
        ['budget efficiency', match.score?.budgetEfficiency ?? 0],
        ['travel efficiency', match.score?.travelEfficiency ?? 0],
        ['time suitability', match.score?.timeSuitability ?? 0]
      ] as [string, number][]
    ).sort((a, b) => a[1] - b[1])[0][0];
    return {
      ...match,
      rankNote: `Ranked #${rank} – ${gap.toFixed(1)} points behind on ${weakest}`
    };
  });

  return { plans: withNotes, recommendedPlanId: winner.id };
}
