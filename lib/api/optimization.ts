import { apiFetch } from './client';

export async function optimizeRoute(dto: unknown) {
  return apiFetch('/route-optimization/optimize', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

export async function optimizeBestPlan(dto: unknown) {
  return apiFetch('/route-optimization/optimize-best', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

export async function getSavedOptimizations() {
  return apiFetch('/route-optimization/saved');
}

export async function getSavedOptimizationById(id: string) {
  return apiFetch(`/route-optimization/saved/${id}`);
}

export async function getMockData() {
  return apiFetch('/route-optimization/mock-data');
}
