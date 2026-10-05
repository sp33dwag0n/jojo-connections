const PUZZLE_URL = 'https://jojo-connections-api.vercel.app/category/puzzle';

/**
 * Fetches a new puzzle. Throws an Error with a readable message on failure.
 */
export async function fetchPuzzle() {
  let response;
  try {
    response = await fetch(PUZZLE_URL);
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
