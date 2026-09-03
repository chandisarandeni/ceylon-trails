import { apiFetch } from './client';

export async function createAttractionSelection(dto: unknown) {
  return apiFetch('/attraction-selection', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

export async function selectAttractions(dto: unknown) {
  return apiFetch('/attraction-selection/select', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

export async function generateCandidatePlans(dto: unknown) {
  return apiFetch('/attraction-selection/plans', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}
