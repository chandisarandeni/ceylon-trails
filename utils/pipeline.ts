import {
  CandidatePlan,
  Module5Weights,
  PipelineIssue,
  PipelineResult,
  UserPreferences
} from '../types/tourism';
import { generateCandidatePlans } from './module4Decision';
import { buildPlanNetwork } from './module3Network';
import { optimizeRoute } from './module1Route';
import { allocateResources } from './module2Resources';
import { scorePlans } from './module5Optimization';

function deriveIssue(plans: CandidatePlan[], prefs: UserPreferences): PipelineIssue | null {
  if (plans.length === 0) {
    return {
      kind: 'interest',
      title: 'Broaden your interests to generate more suitable plans.',
      message:
        'No attraction in the database scored high enough against the current interest weights to form a candidate plan.',
      suggestions: [
        'Raise at least one core interest to Medium or High',
        'Add optional interests such as beach, food or history',
        'Increase the maximum number of destinations'
      ]
    };
  }
  const anyFeasible = plans.some((p) => !p.excluded);
  if (anyFeasible) return null;

  const budgetBlocked = plans.filter((p) => !p.resources.budgetFeasible).length;
  const timeBlocked = plans.filter(
    (p) => !p.resources.timeFeasible || !p.resources.dailyTravelFeasible
  ).length;

  if (budgetBlocked >= timeBlocked) {
    const cheapest = Math.min(...plans.map((p) => p.resources.totalCost));
    return {
      kind: 'budget',
      title: 'No feasible plan was found within your current budget.',
      message: `The cheapest candidate costs Rs.${cheapest.toLocaleString(
        'en-US'
      )} against a budget of Rs.${prefs.budget.toLocaleString('en-US')}.`,
      suggestions: [
        `Increase the budget to about Rs.${(Math.ceil(cheapest / 5000) * 5000).toLocaleString('en-US')}`,
        'Switch travel style to Budget to lower lodging and food costs',
        'Reduce the maximum number of destinations',
        'Lower the emergency reserve requirement'
      ]
    };
  }
  return {
    kind: 'time',
    title: 'No plan satisfies the current travel-time constraint.',
    message: `Every candidate needs more than ${prefs.days} days under a ${prefs.maxDailyTravelHours}h daily travel cap.`,
    suggestions: [
      'Increase the trip duration',
      'Raise the maximum daily travel time',
      'Reduce the number of destinations',
      'Choose a faster transport option such as Private Car'
    ]
  };
}

/** Runs the full five-module pipeline in the required order. */
export function runPipeline(
  prefs: UserPreferences,
  weights: Module5Weights
): PipelineResult {
  // MODULE 4 – intelligent decision & destination recommendation
  const { ranked, drafts } = generateCandidatePlans(prefs);

  const built: CandidatePlan[] = drafts.map((draft, index) => {
    // MODULE 3 – tourism network analysis
    const network = buildPlanNetwork(draft.attractionIds, prefs);
    // MODULE 1 – route optimization inside this plan
    const route = optimizeRoute(network, draft.attractionIds, prefs);
    // MODULE 2 – resource allocation & feasibility
    const { resources, days } = allocateResources(draft.attractionIds, route, prefs);

    return {
      id: `plan-${index + 1}`,
      index: index + 1,
      label: draft.label,
      strategy: draft.strategy,
      strategyNote: draft.strategyNote,
      attractionIds: draft.attractionIds,
      interestScore: draft.interestScore,
      rawInterest: draft.rawInterest,
      activityCost: draft.activityCost,
      visitDurationHours: draft.visitDurationHours,
      matchReasons: draft.matchReasons,
      network,
      route,
      days,
      resources,
      score: null,
      excluded: false,
      exclusionReason: null,
      rankNote: ''
    };
  });

  // MODULE 5 – overall travel optimization
  const { plans, recommendedPlanId } = scorePlans(built, prefs, weights);

  return {
    preferences: prefs,
    weights,
    plans,
    recommendedPlanId,
    issue: deriveIssue(plans, prefs),
    rankedAttractions: ranked.map((r) => ({
      attraction: r.attraction,
      fit: r.fit,
      interest: r.interest
    })),
    generatedAt: Date.now()
  };
}

/** Re-runs only Module 5 when the MCDM weights change. */
export function rescore(result: PipelineResult, weights: Module5Weights): PipelineResult {
  const { plans, recommendedPlanId } = scorePlans(result.plans, result.preferences, weights);
  return { ...result, weights, plans, recommendedPlanId };
}
