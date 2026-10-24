// Progress on today's daily puzzle, kept in localStorage so a reload or revisit picks up where the
// player left off. Only one day is stored: { version, date, puzzleKey, guesses: [[id, id, id, id], ...] }
const STORAGE_KEY = "jojo-connections:daily";
const VERSION = 1;

// Identifies a puzzle by its groups of character ids, so a changed puzzle on the same date doesn't match
export function puzzleKey(puzzle) {
  return puzzle
    .map((category) => category.characters.map((c) => c._id).sort().join(","))
    .join("|");
}

// Saved guesses for this date and puzzle, or [] (clearing the save) if it's for a different day or puzzle
export function loadDailyProgress(date, key) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (
      saved?.version === VERSION &&
      saved.date === date &&
      saved.puzzleKey === key &&
      Array.isArray(saved.guesses)
    ) {
      return saved.guesses;
    }
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked (e.g. private browsing) or corrupt JSON: play without saving
  }
  return [];
}

export function saveDailyProgress(date, key, guesses) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: VERSION, date, puzzleKey: key, guesses }),
    );
  } catch {
    // Storage blocked or full: progress just won't survive a reload
  }
}
