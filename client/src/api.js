// Override with VITE_API_URL in client/.env.local if the server runs elsewhere
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5050').replace(/\/+$/, '');

/**
 * Small fetch wrapper: parses JSON and throws an Error with the server's message on failure.
 */
export async function api(path) {
  let response;
  try {
    response = await fetch(API_URL + path);
  } catch {
    throw new Error("Can't reach the server. Is it running?");
  }

  if (response.status === 429) {
    throw new Error('Too many requests. Wait a minute and try again.');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }
  return data;
}
