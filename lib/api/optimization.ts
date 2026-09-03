import { apiFetch } from './client';

/**
 * POST /route-optimization/optimize
 * Accepts a single plan (OptimizeSinglePlanDto) or array of plans (OptimizePlansDto).
 * Saves result to 'routeoptimizations' collection.
 */
export async function optimizeRoute(dto: unknown) {
  return apiFetch('/route-optimization/optimize', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

/**
 * POST /route-optimization/optimize-best
 * Accepts multiple plans, returns the single best optimized route.
 * Saves result to 'routeoptimizations' collection.
 * Also accepts { networkId } to use plans from a saved TourismNetwork.
 */
export async function optimizeBestPlan(dto: unknown) {
  return apiFetch('/route-optimization/optimize-best', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

/**
 * GET /route-optimization/network/:networkId
 * Reads TourismNetwork matrices from MongoDB by networkId,
 * runs route optimization, and saves result to 'routeoptimizations' collection.
 */
export async function optimizeFromNetworkId(networkId: string) {
  return apiFetch(`/route-optimization/network/${networkId}`);
}

/**
 * GET /route-optimization/saved
 * Retrieves all saved route optimization results.
 */
export async function getSavedOptimizations() {
  return apiFetch('/route-optimization/saved');
}

/**
 * GET /route-optimization/saved/:id
 * Retrieves a specific saved route optimization result by MongoDB _id.
 */
export async function getSavedOptimizationById(id: string) {
  return apiFetch(`/route-optimization/saved/${id}`);
}

/**
 * GET /route-optimization/mock-data
 * Runs optimization with mock data (development/testing only).
 */
export async function getMockData() {
  return apiFetch('/route-optimization/mock-data');
}
