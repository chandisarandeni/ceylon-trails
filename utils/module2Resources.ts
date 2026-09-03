import { ATTRACTION_MAP, OPTIONAL_ACTIVITIES } from '../lib/data/attractions';
import {
  DayPlan,
  KnapsackResult,
  OptionalActivity,
  OptimizedRoute,
  ResourceAllocation,
  UserPreferences
} from '../types/tourism';
import { buildItinerary } from './itinerary';
import { interestWeights } from './module4Decision';

const UNIT = 500; // rupee granularity for the DP table

/** 0/1 knapsack over optional experiences – maximise interest value within leftover budget. */
export function allocateOptionalActivities(
  candidates: OptionalActivity[],
  capacity: number
): KnapsackResult {
  const capUnits = Math.max(0, Math.floor(capacity / UNIT));
  const items = candidates.filter((c) => c.cost <= capacity);
  const table: number[][] = Array.from({ length: items.length + 1 }, () =>
    new Array(capUnits + 1).fill(0)
  );

  for (let i = 1; i <= items.length; i += 1) {
    const weight = Math.ceil(items[i - 1].cost / UNIT);
    const value = items[i - 1].value;
    for (let w = 0; w <= capUnits; w += 1) {
      table[i][w] =
        weight <= w ? Math.max(table[i - 1][w], table[i - 1][w - weight] + value) : table[i - 1][w];
    }
  }

  const selected: OptionalActivity[] = [];
  let w = capUnits;
  for (let i = items.length; i > 0; i -= 1) {
    if (table[i][w] !== table[i - 1][w]) {
      selected.push(items[i - 1]);
      w -= Math.ceil(items[i - 1].cost / UNIT);
    }
  }
  selected.reverse();

  return {
    capacity,
    selected,
    totalCost: selected.reduce((sum, s) => sum + s.cost, 0),
    totalValue: selected.reduce((sum, s) => sum + s.value, 0),
    considered: candidates,
    table
  };
}

function optionalCandidatesFor(
  attractionIds: string[],
  prefs: UserPreferences
): OptionalActivity[] {
  const cities = new Set(
    attractionIds.map((id) => ATTRACTION_MAP[id]?.city).filter(Boolean) as string[]
  );
  const weights = interestWeights(prefs);
  return OPTIONAL_ACTIVITIES.filter((a) => cities.has(a.city) || a.city === 'Colombo').map((a) => ({
    ...a,
    value: Math.round(a.value * (1 + (weights[a.linkedInterest] ?? 0)) * 10) / 10
  }));
}

/**
 * MODULE 2 – resource requirement & feasibility for ONE candidate plan,
 * using the optimised route from Module 1.
 */
export function allocateResources(
  attractionIds: string[],
  route: OptimizedRoute,
  prefs: UserPreferences
): { resources: ResourceAllocation; days: DayPlan[] } {
  const itinerary = buildItinerary(route, prefs);
  const transportCost = route.totalTravelCost;
  const coreActivityCost = attractionIds.reduce(
    (sum, id) => sum + (ATTRACTION_MAP[id]?.activityCost ?? 0),
    0
  );

  const committed =
    transportCost +
    itinerary.accommodationCost +
    itinerary.foodCost +
    coreActivityCost +
    prefs.emergencyReserve;

  const leftover = Math.max(0, prefs.budget - committed);
  const knapsack = allocateOptionalActivities(optionalCandidatesFor(attractionIds, prefs), leftover);

  const activityCost = coreActivityCost + knapsack.totalCost;
  const totalCost =
    transportCost +
    itinerary.accommodationCost +
    itinerary.foodCost +
    activityCost +
    prefs.emergencyReserve;
  const remainingBudget = prefs.budget - totalCost;
  const budgetFeasible = remainingBudget >= 0;

  const notes: string[] = [];
  if (!budgetFeasible) {
    notes.push(
      `Exceeds available budget by Rs.${Math.abs(remainingBudget).toLocaleString('en-US')}.`
    );
  }
  if (!itinerary.timeFeasible) {
    notes.push(
      `Needs ${itinerary.daysRequired} days under a ${prefs.maxDailyTravelHours}h/day travel cap; only ${prefs.days} available.`
    );
  }
  if (!itinerary.dailyTravelFeasible) {
    notes.push(
      `One transfer reaches ${itinerary.peakDailyTravelHours}h, above the ${prefs.maxDailyTravelHours}h daily limit.`
    );
  }
  if (knapsack.selected.length) {
    notes.push(
      `DP allocation added ${knapsack.selected.length} optional experience(s) from Rs.${leftover.toLocaleString(
        'en-US'
      )} of unused budget.`
    );
  }
  if (budgetFeasible && itinerary.timeFeasible && itinerary.dailyTravelFeasible) {
    notes.push('All budget and time constraints satisfied.');
  }

  // Running remaining-budget per day (emergency reserve held aside).
  let spent = 0;
  const days = itinerary.days.map((day) => {
    spent += day.dayCost;
    return {
      ...day,
      remainingBudget: prefs.budget - prefs.emergencyReserve - spent
    };
  });

  return {
    resources: {
      transportCost,
      accommodationCost: itinerary.accommodationCost,
      accommodationNights: itinerary.accommodationNights,
      foodCost: itinerary.foodCost,
      activityCost,
      optionalActivityCost: knapsack.totalCost,
      emergencyReserve: prefs.emergencyReserve,
      totalCost,
      remainingBudget,
      budgetFeasible,
      timeFeasible: itinerary.timeFeasible,
      dailyTravelFeasible: itinerary.dailyTravelFeasible,
      feasible: budgetFeasible && itinerary.timeFeasible && itinerary.dailyTravelFeasible,
      daysRequired: itinerary.daysRequired,
      peakDailyTravelHours: itinerary.peakDailyTravelHours,
      knapsack,
      notes
    },
    days
  };
}
