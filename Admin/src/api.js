import { getToken, clearToken } from './auth';

// Override with VITE_API_URL in Admin/.env.local if the server runs elsewhere
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

/**
 * Small fetch wrapper: sends JSON + the admin token, parses JSON, and throws an Error
 * with the server's message on failure. A 401/403 on an authed request means the
 * session expired, so the token is cleared and the user is sent back to the login page.
 */
export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) headers.Authorization = `Bearer ${getToken()}`;

  let response;
  try {
    response = await fetch(API_URL + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Is it running?");
  }

  const data = await response.json().catch(() => null);

  if (auth && (response.status === 401 || response.status === 403)) {
    clearToken();
    window.location.assign('/admin');
    throw new Error('Session expired. Please log in again.');
  }
  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }
  return data;
}
