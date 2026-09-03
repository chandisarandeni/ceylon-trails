import { apiFetch } from './client';

export async function calculateItinerary(dto: unknown) {
  return apiFetch('/trip-feasibility/itinerary', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

export async function calculateFeasibility(dto: unknown) {
  return apiFetch('/trip-feasibility/feasibility', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}
