import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_PREFERENCES, DEFAULT_WEIGHTS } from '../lib/data/defaultPreferences';
import { ATTRACTIONS, ATTRACTION_MAP, getPoint } from '../lib/data/attractions';
import { Module5Weights, PipelineResult, UserPreferences } from '../types/tourism';
import { rescore, runPipeline } from '../utils/pipeline';
import { greedyRankPlans } from '../lib/api/ranking';
import { calculateFeasibility } from '../lib/api/feasibility';
import { createAttractionSelection, generateCandidatePlans } from '../lib/api/attractions';
import { createTourismNetwork } from '../lib/api/network';
import { optimizeFromNetworkId } from '../lib/api/optimization';



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

            // STEP 3: POST /travel-plan-ranking/greedy → saves to 'travelplanrankings' collection
            try {
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
            } catch (rankErr) {
              console.log('travelplanrankings save notice:', rankErr);
            }

            // STEP 4: POST /api/tourism-network → saves to 'tourismnetworks' collection
            // Then use returned networkId for route-optimization to save 'routeoptimizations'
            // CandidatePlanDto.selectedAttractions needs: { attraction: { id, name, latitude, longitude, ... } }
            let networkId: string | null = null;
            try {
              const networkPayload = {
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
                        categories: item
                          ? (Object.entries(item.scores) as [string, number][])
                              .filter(([, s]) => s > 0)
                              .map(([k]) => k.toUpperCase())
                          : ['NATURE'],
                        isAvailable: true,
                        latitude: pt.lat,
                        longitude: pt.lng
                      },
                      interestScore: p.interestScore,
                      normalizedScore: p.interestScore / 100
                    };
                  })
                })),
                // TransportationMode enum: 'private' | 'public'
                preferredTransportation: state.preferences.transport === 'Private Transport' ? 'private' : 'public',
                startingLocation: { name: startPt.city || startPt.name, latitude: startPt.lat, longitude: startPt.lng },
                endingLocation: { name: endPt.city || endPt.name, latitude: endPt.lat, longitude: endPt.lng }
              };

              const networkResponse = await createTourismNetwork(networkPayload) as { networkId?: string };
              networkId = networkResponse?.networkId || null;
            } catch (networkErr) {
              console.log('tourismnetworks save notice:', networkErr);
            }

            // STEP 5: GET /route-optimization/network/:networkId → reads tourismnetworks, saves to 'routeoptimizations'
            if (networkId) {
              try {
                await optimizeFromNetworkId(networkId);
              } catch (routeErr) {
                console.log('routeoptimizations save notice:', routeErr);
              }
            }

            // STEP 6: POST /trip-feasibility/feasibility → saves to 'tripfeasibilities' collection
            // Strict validation: destinations must match attractionNames exactly; routeSegments must be continuous
            const topPlan = computed.plans[0];

            // Map TravelStyle ('Budget' | 'Balanced' | 'Comfort') to lowercase backend enum
            const travelStyleLower = state.preferences.travelStyle.toLowerCase() as 'budget' | 'balanced' | 'comfort';

            // Map TransportMode ('Public Transport' | 'Private Transport') to backend string
            const transportStyle = state.preferences.transport === 'Private Transport'
              ? 'private transport'
              : 'public transport';

            // Build selectedAttractions with attraction names as IDs (backend matches by name OR id)
            const selectedAttractionsForFeasibility = topPlan.attractionIds.map((id) => {
              const item = ATTRACTION_MAP[id];
              return {
                attractionId: item?.name || id,       // use name so it matches destinations
                attractionName: item?.name || id,
                activityCost: item?.activityCost || 0,
                visitDuration: item?.visitDuration || 1,
                interestScore: topPlan.interestScore
              };
            });

            // Build destinations using attraction names (must match attractionName/attractionId)
            const startName = startPt.city || startPt.name;
            const endName = endPt.city || endPt.name;
            const attractionNames = topPlan.attractionIds.map((id) => ATTRACTION_MAP[id]?.name || id);
            const destinations = [startName, ...attractionNames, endName];

            // Build route segments (N-1 segments for N destinations, continuous)
            const segCount = destinations.length - 1;
            const segTime = segCount > 0 ? topPlan.route.totalTravelHours / segCount : 0;
            const segDist = segCount > 0 ? topPlan.route.totalDistanceKm / segCount : 0;
            const segCost = segCount > 0 ? topPlan.route.totalTravelCost / segCount : 0;

            const routeSegments = destinations.slice(0, -1).map((from, i) => ({
              from,
              to: destinations[i + 1],
              travelTime: Math.round(segTime * 100) / 100,
              travelDistance: Math.round(segDist * 100) / 100,
              travelCost: Math.round(segCost * 100) / 100
            }));

            // Recalculate totals from segments to ensure consistency (backend validates sum)
            const totalTime = routeSegments.reduce((s, r) => s + r.travelTime, 0);
            const totalDist = routeSegments.reduce((s, r) => s + r.travelDistance, 0);
            const totalCost = routeSegments.reduce((s, r) => s + r.travelCost, 0);

            try {
              await calculateFeasibility({
                tripDuration: state.preferences.days,
                maxDailyTravelTime: state.preferences.maxDailyTravelHours,
                totalBudget: state.preferences.budget,
                minEmergencyReserve: state.preferences.emergencyReserve,
                travelStyle: travelStyleLower,
                transportationStyle: transportStyle,
                startingLocation: { name: startName },
                endingLocation: { name: endName },
                selectedAttractions: selectedAttractionsForFeasibility,
                optimizedRoute: {
                  destinations,
                  routeSegments,
                  totalTravelTime: Math.round(totalTime * 100) / 100,
                  totalTravelDistance: Math.round(totalDist * 100) / 100,
                  totalTravelCost: Math.round(totalCost * 100) / 100
                }
              });
            } catch (feasErr) {
              console.log('tripfeasibilities save notice:', feasErr);
            }

            backendSynced = true;
          }
        } catch (err) {
          console.log('Backend pipeline sync error:', err);
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
