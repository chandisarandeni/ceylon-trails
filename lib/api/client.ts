const getBaseUrl = () => {
  // In the browser, use Next.js proxy rewrite (/api/backend) to avoid CORS restrictions
  if (typeof window !== 'undefined') {
    return '/api/backend';
  }
  return process.env.NEXT_PUBLIC_API_URL || '';
};

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${cleanEndpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

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
    const message = Array.isArray(errorJson?.message)
      ? errorJson.message.join(', ')
      : errorJson?.message || `API error ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }

  return await res.json();
}
