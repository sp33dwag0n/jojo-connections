const API_URL = 'https://jojo-connections-api.vercel.app';

/**
 * GETs a path from the puzzle API. Throws an Error with a readable message on failure.
 */
async function request(path) {
  let response;
  try {
    response = await fetch(API_URL + path);
  } catch {
    throw new Error("Can't reach the puzzle server. Check your connection and try again.");
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

// A new random puzzle every call (practice mode)
export const fetchRandomPuzzle = () => request('/puzzle');

// The shared puzzle for a "YYYY-MM-DD" date
export const fetchDailyPuzzle = (date) => request(`/puzzle/daily?date=${encodeURIComponent(date)}`);
