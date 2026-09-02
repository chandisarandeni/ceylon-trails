import { apiFetch } from './client';

export async function createTourismNetwork(dto: unknown) {
  return apiFetch('/api/tourism-network', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

export async function getTourismNetwork(networkId: string) {
  return apiFetch(`/api/tourism-network/${networkId}`);
}

export async function estimateConnection(dto: unknown) {
  return apiFetch('/api/tourism-network/estimate', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}
