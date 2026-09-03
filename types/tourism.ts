export type InterestLevel = 'Low' | 'Medium' | 'High';

export type CoreInterestKey = 'nature' | 'wildlife' | 'culture' | 'adventure';

export type OptionalInterestKey =
  | 'beach'
  | 'food'
  | 'shopping'
  | 'history'
  | 'religious';

export type ScoreKey = CoreInterestKey | OptionalInterestKey;

export type TravelStyle = 'Budget' | 'Balanced' | 'Comfort';

export type TransportMode = 'Public Transport' | 'Private Transport';

export interface Attraction {
  id: string;
  name: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  scores: Record<ScoreKey, number>;
  activityCost: number;
  visitDuration: number;
  popularity: number;
  recommendedSeason: string;
  description: string;
}

export interface Hub {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
}

export interface OptionalActivity {
  id: string;
  name: string;
  city: string;
  cost: number;
  value: number;
  durationHours: number;
  linkedInterest: ScoreKey;
}

export interface UserPreferences {
  name: string;
  country: string;
  days: number;
  budget: number;
  startHubId: string;
  endHubId: string;
  travelStyle: TravelStyle;
  transport: TransportMode;
  interests: Record<ScoreKey, InterestLevel>;
  optionalInterests: ScoreKey[];
  maxDailyTravelHours: number;
  emergencyReserve: number;
  maxDestinations: number;
}

/* ---------- Module 3: network ---------- */

export interface NetworkEdge {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  travelHours: number;
  travelCost: number;
  transport: string;
}

export interface PlanNetwork {
  nodeIds: string[];
  edges: NetworkEdge[];
  degrees: Record<string, number>;
  mostConnectedId: string;
  avgDistanceKm: number;
  componentCount: number;
  bfsOrder: string[];
  dfsOrder: string[];
  remoteEdges: NetworkEdge[];
}

/* ---------- Module 1: routes ---------- */

export interface RouteLeg {
  from: string;
  to: string;
  distanceKm: number;
  travelHours: number;
  travelCost: number;
  transport: string;
  via: string[];
}

export interface RouteCandidate {
  label: string;
  method: string;
  order: string[];
  totalDistanceKm: number;
  totalTravelHours: number;
  totalTravelCost: number;
}

export interface OptimizedRoute extends RouteCandidate {
  legs: RouteLeg[];
  candidates: RouteCandidate[];
  improvementKm: number;
}

/* ---------- Itinerary ---------- */

export interface DayPlan {
  day: number;
  title: string;
  fromId: string | null;
  toId: string;
  travelHours: number;
  travelCost: number;
  transport: string;
  activities: { name: string; hours: number; cost: number }[];
  activityCost: number;
  accommodation: string | null;
  accommodationCost: number;
  foodCost: number;
  dayCost: number;
  remainingBudget: number;
  note: string;
}

/* ---------- Module 2: resources ---------- */

export interface KnapsackResult {
  capacity: number;
  selected: OptionalActivity[];
  totalCost: number;
  totalValue: number;
  considered: OptionalActivity[];
  table: number[][];
}

export interface ResourceAllocation {
  transportCost: number;
  accommodationCost: number;
  accommodationNights: number;
  foodCost: number;
  activityCost: number;
  optionalActivityCost: number;
  emergencyReserve: number;
  totalCost: number;
  remainingBudget: number;
  budgetFeasible: boolean;
  timeFeasible: boolean;
  dailyTravelFeasible: boolean;
  feasible: boolean;
  daysRequired: number;
  peakDailyTravelHours: number;
  knapsack: KnapsackResult;
  notes: string[];
}

/* ---------- Module 5 ---------- */

export interface Module5Weights {
  interest: number;
  budget: number;
  travel: number;
  time: number;
}

export interface PlanScoreBreakdown {
  interestSatisfaction: number;
  budgetEfficiency: number;
  travelEfficiency: number;
  timeSuitability: number;
  overallScore: number;
}

/* ---------- Candidate plan ---------- */

export interface CandidatePlan {
  id: string;
  index: number;
  label: string;
  strategy: string;
  strategyNote: string;
  attractionIds: string[];
  interestScore: number;
  rawInterest: number;
  activityCost: number;
  visitDurationHours: number;
  matchReasons: string[];
  network: PlanNetwork;
  route: OptimizedRoute;
  days: DayPlan[];
  resources: ResourceAllocation;
  score: PlanScoreBreakdown | null;
  excluded: boolean;
  exclusionReason: string | null;
  rankNote: string;
}

export interface PipelineIssue {
  kind: 'budget' | 'time' | 'interest';
  title: string;
  message: string;
  suggestions: string[];
}

export interface PipelineResult {
  preferences: UserPreferences;
  weights: Module5Weights;
  plans: CandidatePlan[];
  recommendedPlanId: string | null;
  issue: PipelineIssue | null;
  rankedAttractions: { attraction: Attraction; fit: number; interest: number }[];
  generatedAt: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date | string;
  country?: string;
}
