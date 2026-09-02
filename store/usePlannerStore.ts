import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_PREFERENCES, DEFAULT_WEIGHTS } from '../lib/data/defaultPreferences';
import { ATTRACTIONS, ATTRACTION_MAP, getPoint } from '../lib/data/attractions';
import { Module5Weights, PipelineResult, UserPreferences } from '../types/tourism';
import { rescore, runPipeline } from '../utils/pipeline';
import { greedyRankPlans } from '../lib/api/ranking';
import { calculateFeasibility } from '../lib/api/feasibility';
import { createAttractionSelection, generateCandidatePlans } from '../lib/api/attractions';

export const MODULE_STEPS = [
  { key: 'decision', module: 'Module 4', title: 'Decision', path: '/decision' },
  { key: 'network', module: 'Module 3', title: 'Network', path: '/network' },
  { key: 'route', module: 'Module 1', title: 'Route', path: '/route' },
  { key: 'resources', module: 'Module 2', title: 'Resources', path: '/resources' },
  { key: 'optimization', module: 'Module 5', title: 'Optimization', path: '/optimization' }
] as const;

export type ModuleKey = (typeof MODULE_STEPS)[number]['key'];

interface PlannerState {
  preferences: UserPreferences;
  weights: Module5Weights;
  result: PipelineResult | null;
  isRunning: boolean;
  runStage: number;
  completed: ModuleKey[];
  activePlanId: string | null;
  backendSynced: boolean;
  
  setPreferences: (update: Partial<UserPreferences>) => void;
  setWeights: (weights: Module5Weights) => void;
  generate: (onDone?: () => void) => void;
  markCompleted: (key: ModuleKey) => void;
  setActivePlanId: (id: string | null) => void;
  reset: () => void;
}

let activeTimers: number[] = [];

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      preferences: DEFAULT_PREFERENCES,
      weights: DEFAULT_WEIGHTS,
      result: null,
      isRunning: false,
      runStage: 0,
      completed: [],
      activePlanId: null,
      backendSynced: false,

      setPreferences: (update) => {
        set((state) => ({
          preferences: { ...state.preferences, ...update }
        }));
      },

      setWeights: (nextWeights) => {
        set((state) => ({
          weights: nextWeights,
          result: state.result ? rescore(state.result, nextWeights) : state.result
        }));
      },

      generate: async (onDone) => {
        activeTimers.forEach((t) => clearTimeout(t));
        activeTimers = [];

        set({
          isRunning: true,
          runStage: 1,
          completed: []
        });

        const state = get();
        // Compute pipeline locally for instant calculation & rich visualization
        const computed = runPipeline(state.preferences, state.weights);

        // Asynchronously sync & persist with NestJS backend & MongoDB Atlas database
        let backendSynced = false;
        try {
          if (computed.plans.length > 0) {
            // Convert 'High'/'Medium'/'Low' interest levels to numeric weights (5/3/1)
            // matching the InterestWeight interface: { interest: InterestCategory; weight: number }
            const interestLevelToWeight = (level: string): number => {
              if (level === 'High') return 5;
              if (level === 'Medium') return 3;
              if (level === 'Low') return 1;
              return 0;
            };

            // Map user interests to uppercase InterestCategory enum strings with numeric weights
            const userInterests = Object.entries(state.preferences.interests)
              .filter(([, level]) => interestLevelToWeight(String(level)) > 0)
              .map(([interest, level]) => ({
                interest: interest.toUpperCase(), // e.g. 'nature' -> 'NATURE'
                weight: interestLevelToWeight(String(level))
              }));

            // Map travelStyle to uppercase enum string (BALANCED, RELAXED, ADVENTURE)
            const rawStyle = state.preferences.travelStyle.toUpperCase();
            const travelStyleUpper = rawStyle.includes('BALANCED')
              ? 'BALANCED'
              : rawStyle.includes('RELAXED')
              ? 'RELAXED'
              : 'ADVENTURE';

            const startPt = getPoint(state.preferences.startHubId);
            const endPt = getPoint(state.preferences.endHubId);

            // 1. Direct MongoDB persistence call to POST /attraction-selection (saves document to 'attractionselections' collection)
            await createAttractionSelection({
              selectionId: `SEL${Date.now()}`,
              tripDuration: state.preferences.days,
              travelStyle: travelStyleUpper,
              destinationCount: state.preferences.maxDestinations || computed.plans[0]?.attractionIds.length || 5,
              userInterests,
              preferredTransportation: state.preferences.transport,
              startingLocation: { name: startPt.city || startPt.name, latitude: startPt.lat, longitude: startPt.lng },
              endingLocation: { name: endPt.city || endPt.name, latitude: endPt.lat, longitude: endPt.lng },
              candidatePlans: computed.plans.map((p, idx) => ({
                planId: p.id,
                rank: idx + 1,
                planInterestScore: p.interestScore,
                diversityScore: 80,
                planScore: Math.round((p.score?.overallScore || 0) * 100),
                selectedAttractions: p.attractionIds.map((id) => {
                  const item = ATTRACTION_MAP[id];
                  const pt = item || getPoint(id);
                  return {
                    attraction: {
                      id: pt.id,
                      name: pt.name,
                      categories: [item ? item.province.toUpperCase() : 'SRI LANKA'],
                      isAvailable: true,
                      latitude: pt.lat,
                      longitude: pt.lng,
                      region: pt.city,
                      district: pt.city,
                      rating: item ? item.popularity : 4.5
                    },
                    interestScore: p.interestScore,
                    normalizedScore: p.interestScore / 100
                  };
                })
              }))
            });

            // 2. Call POST /attraction-selection/plans — this endpoint persists to MongoDB attractionselections
            // Categories must be InterestCategory enum values (e.g. NATURE, CULTURE, BEACH)
            // derived from the attraction's scores keys (not province names)
            await generateCandidatePlans({
              tripDuration: state.preferences.days,
              travelStyle: travelStyleUpper,
              userInterests,
              availableAttractions: ATTRACTIONS.map((a) => {
                // Convert scores keys with non-zero values to InterestCategory enum strings
                const categories = (Object.entries(a.scores) as [string, number][])
                  .filter(([, score]) => score > 0)
                  .map(([key]) => key.toUpperCase()); // nature->NATURE, culture->CULTURE, etc.
                return {
                  id: a.id,
                  name: a.name,
                  categories,
                  isAvailable: true,
                  latitude: a.lat,
                  longitude: a.lng,
                  region: a.city,
                  district: a.city,
                  rating: a.popularity
                };
              }),
              preferredTransportation: state.preferences.transport,
              startingLocation: { name: startPt.city || startPt.name, latitude: startPt.lat, longitude: startPt.lng },
              endingLocation: { name: endPt.city || endPt.name, latitude: endPt.lat, longitude: endPt.lng }
            });

            // 3. Call travel-plan-ranking backend endpoint
            await greedyRankPlans({
              candidatePlans: computed.plans.map((p) => ({
                planId: p.id,
                interestScore: p.interestScore,
                totalTravelTime: p.route.totalTravelHours,
                daysRequired: p.resources.daysRequired,
                totalCost: p.resources.totalCost,
                feasible: p.resources.feasible
              })),
              preferences: {
                budget: state.preferences.budget,
                tripDuration: state.preferences.days,
                maximumTravelTime: state.preferences.maxDailyTravelHours,
                weights: state.weights
              }
            });

            // 4. Call trip-feasibility backend endpoint for the top plan
            // CalculateTripFeasibilityDto exact field names:
            //   - travelStyle: 'budget' | 'balanced' | 'comfort' (lowercase)
            //   - transportationStyle: 'private transport' | 'public transport' (full string)
            //   - selectedAttractions: { attractionId, attractionName, activityCost, visitDuration, interestScore }
            //   - optimizedRoute: { destinations, routeSegments, totalTravelTime, totalTravelDistance, totalTravelCost }
            //   - startingLocation/endingLocation: { name, latitude?, longitude? }
            const topPlan = computed.plans[0];

            // Map TravelStyle ('Budget' | 'Balanced' | 'Comfort') to lowercase backend enum
            const travelStyleLower = state.preferences.travelStyle.toLowerCase() as 'budget' | 'balanced' | 'comfort';

            // Map TransportMode ('Public Transport' | 'Private Transport') to backend string
            const transportStyle = state.preferences.transport === 'Private Transport'
              ? 'private transport'
              : 'public transport';

            // Build route segment pairs from route order
            const routeOrder = topPlan.route.order;
            const segmentCount = Math.max(0, routeOrder.length - 1);
            const segmentTravelTime = segmentCount > 0 ? topPlan.route.totalTravelHours / segmentCount : 0;
            const segmentDistance = segmentCount > 0 ? topPlan.route.totalDistanceKm / segmentCount : 0;
            const segmentCost = segmentCount > 0 ? topPlan.route.totalTravelCost / segmentCount : 0;

            const routeSegments = routeOrder.slice(0, -1).map((from, i) => ({
              from,
              to: routeOrder[i + 1],
              travelTime: segmentTravelTime,
              travelDistance: segmentDistance,
              travelCost: segmentCost
            }));

            await calculateFeasibility({
              tripDuration: state.preferences.days,
              maxDailyTravelTime: state.preferences.maxDailyTravelHours,
              totalBudget: state.preferences.budget,
              minEmergencyReserve: state.preferences.emergencyReserve,
              travelStyle: travelStyleLower,
              transportationStyle: transportStyle,
              startingLocation: { name: startPt.city || startPt.name, latitude: startPt.lat, longitude: startPt.lng },
              endingLocation: { name: endPt.city || endPt.name, latitude: endPt.lat, longitude: endPt.lng },
              selectedAttractions: topPlan.attractionIds.map((id) => {
                const item = ATTRACTION_MAP[id];
                return {
                  attractionId: id,
                  attractionName: item?.name || id,
                  activityCost: item?.activityCost || 0,
                  visitDuration: item?.visitDuration || 1,
                  interestScore: topPlan.interestScore
                };
              }),
              optimizedRoute: {
                destinations: routeOrder,
                routeSegments,
                totalTravelTime: topPlan.route.totalTravelHours,
                totalTravelDistance: topPlan.route.totalDistanceKm,
                totalTravelCost: topPlan.route.totalTravelCost
              }
            });

            backendSynced = true;
          }
        } catch (err) {
          console.log('Backend API sync notice:', err);
        }

        MODULE_STEPS.forEach((_, index) => {
          const timer = window.setTimeout(() => {
            set({ runStage: index + 1 });
          }, index * 380);
          activeTimers.push(timer);
        });

        const finish = window.setTimeout(() => {
          set({
            result: computed,
            activePlanId: computed.recommendedPlanId ?? computed.plans[0]?.id ?? null,
            completed: ['decision'],
            isRunning: false,
            runStage: MODULE_STEPS.length,
            backendSynced
          });
          onDone?.();
        }, MODULE_STEPS.length * 380 + 220);
        activeTimers.push(finish);
      },

      markCompleted: (key) => {
        set((state) => ({
          completed: state.completed.includes(key) ? state.completed : [...state.completed, key]
        }));
      },

      setActivePlanId: (id) => set({ activePlanId: id }),

      reset: () => {
        activeTimers.forEach((t) => clearTimeout(t));
        activeTimers = [];
        set({
          result: null,
          completed: [],
          activePlanId: null,
          runStage: 0,
          isRunning: false,
          backendSynced: false,
          preferences: DEFAULT_PREFERENCES,
          weights: DEFAULT_WEIGHTS
        });
      }
    }),
    {
      name: 'ceylon_trails_planner',
      partialize: (state) => ({
        preferences: state.preferences,
        weights: state.weights,
        result: state.result,
        completed: state.completed,
        activePlanId: state.activePlanId
      })
    }
  )
);
