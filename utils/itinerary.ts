import { ATTRACTION_MAP, pointName } from '../lib/data/attractions';
import { DayPlan, OptimizedRoute, UserPreferences } from '../types/tourism';
import { PROVINCE_LODGING_MULTIPLIER, STYLE_PROFILES } from './geo';

const DAILY_ACTIVITY_CAPACITY = 9;

interface DraftDay {
  travelHours: number;
  travelCost: number;
  transport: string;
  fromId: string | null;
  toId: string;
  activities: { name: string; hours: number; cost: number }[];
  activityHours: number;
  note: string;
}

export interface ItineraryPlan {
  days: DayPlan[];
  daysRequired: number;
  peakDailyTravelHours: number;
  accommodationNights: number;
  accommodationCost: number;
  foodCost: number;
  timeFeasible: boolean;
  dailyTravelFeasible: boolean;
}

/** Packs the optimised route into calendar days under the daily travel-time constraint. */
export function buildItinerary(route: OptimizedRoute, prefs: UserPreferences): ItineraryPlan {
  const style = STYLE_PROFILES[prefs.travelStyle];
  const drafts: DraftDay[] = [];
  let current: DraftDay = {
    travelHours: 0,
    travelCost: 0,
    transport: '–',
    fromId: null,
    toId: prefs.startHubId,
    activities: [],
    activityHours: 0,
    note: 'Arrival & orientation'
  };

  const startNewDay = (toId: string, note: string) => {
    drafts.push(current);
    current = {
      travelHours: 0,
      travelCost: 0,
      transport: '–',
      fromId: current.toId,
      toId,
      activities: [],
      activityHours: 0,
      note
    };
  };

  const isMultiDay = prefs.days >= 5;
  const maxActivitiesPerDay = isMultiDay ? 2 : 3;
  const maxActivityHoursPerDay = isMultiDay ? 6 : DAILY_ACTIVITY_CAPACITY;

  route.legs.forEach((leg) => {
    const wouldExceedTravel =
      current.travelHours > 0 && current.travelHours + leg.travelHours > prefs.maxDailyTravelHours;
    if (wouldExceedTravel) startNewDay(leg.to, 'Transfer day');

    current.fromId = current.fromId ?? leg.from;
    current.toId = leg.to;
    current.travelHours += leg.travelHours;
    current.travelCost += leg.travelCost;
    current.transport = leg.transport;

    const attraction = ATTRACTION_MAP[leg.to];
    if (attraction) {
      const overCount = current.activities.length >= maxActivitiesPerDay;
      const overActivity =
        current.activityHours + attraction.visitDuration > maxActivityHoursPerDay;
      const overCombined =
        current.travelHours + current.activityHours + attraction.visitDuration >
        prefs.maxDailyTravelHours + maxActivityHoursPerDay;

      if ((overCount || overActivity || overCombined) && current.activities.length > 0) {
        startNewDay(leg.to, `Explore ${attraction.city}`);
      }

      current.activities.push({
        name: attraction.name,
        hours: attraction.visitDuration,
        cost: attraction.activityCost
      });
      current.activityHours += attraction.visitDuration;
      current.note = `Visit ${attraction.city}`;
    }
  });
  drafts.push(current);



  const daysRequired = drafts.length;
  const nights = Math.max(0, daysRequired - 1);
  const peakDailyTravelHours = drafts.reduce((max, d) => Math.max(max, d.travelHours), 0);

  let accommodationCost = 0;
  const days: DayPlan[] = drafts.map((draft, index) => {
    const isLastNight = index >= nights;
    const attraction = ATTRACTION_MAP[draft.toId];
    const multiplier = attraction
      ? PROVINCE_LODGING_MULTIPLIER[attraction.province] ?? 1
      : 1.05;
    const nightCost = isLastNight ? 0 : Math.round((style.nightRate * multiplier) / 50) * 50;
    accommodationCost += nightCost;
    const activityCost = draft.activities.reduce((sum, a) => sum + a.cost, 0);
    return {
      day: index + 1,
      title: draft.note,
      fromId: draft.fromId,
      toId: draft.toId,
      travelHours: Math.round(draft.travelHours * 10) / 10,
      travelCost: draft.travelCost,
      transport: draft.transport,
      activities: draft.activities,
      activityCost,
      accommodation: isLastNight ? null : `${style.label} – ${pointName(draft.toId)}`,
      accommodationCost: nightCost,
      foodCost: style.foodPerDay,
      dayCost: draft.travelCost + activityCost + nightCost + style.foodPerDay,
      remainingBudget: 0,
      note: draft.note
    };
  });

  return {
    days,
    daysRequired,
    peakDailyTravelHours: Math.round(peakDailyTravelHours * 10) / 10,
    accommodationNights: nights,
    accommodationCost,
    foodCost: style.foodPerDay * daysRequired,
    timeFeasible: daysRequired <= prefs.days,
    dailyTravelFeasible: peakDailyTravelHours <= prefs.maxDailyTravelHours + 0.5
  };
}
