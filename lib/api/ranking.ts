import { apiFetch } from './client';

export async function rankPlans(dto: unknown) {
  return apiFetch('/travel-plan-ranking/rank', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

export async function greedyRankPlans(dto: unknown) {
  return apiFetch('/travel-plan-ranking/greedy', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}
