const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        // empty
      }
      throw new Error(errorJson?.message || `API error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err: unknown) {
    console.warn(`[API fetch failed for ${endpoint}]`, err);
    throw err;
  }
}
