import express from "express";
import db from "../db/connection.js";
import { toObjectId, httpError, shuffle, seededRandom } from "../util.js";

const category = express.Router();

const GROUP_SIZE = 4;
const DIFFICULTIES = [0, 1, 2, 3];
const DAY_MS = 24 * 60 * 60 * 1000;
const DAILY_CACHE_MS = 5 * 60 * 1000; // how long admin edits can take to show up in the daily puzzle

// date -> { promise, expires }. Stores the promise so simultaneous requests share one build.
const dailyCache = new Map();

function getDailyPuzzle(date) {
  const now = Date.now();
  for (const [key, entry] of dailyCache) {
    if (entry.expires <= now) dailyCache.delete(key);
  }

  let entry = dailyCache.get(date);
  if (!entry) {
    const promise = loadPools().then((pools) =>
      buildPuzzle(pools, seededRandom(`jojo-daily:${date}`)),
    );
    entry = { promise, expires: now + DAILY_CACHE_MS };
    dailyCache.set(date, entry);
    // Don't keep failures around; the next request should retry
    promise.catch(() => {
      if (dailyCache.get(date) === entry) dailyCache.delete(date);
    });
  }
  return entry.promise;
}

// Map of character id string -> character document
async function getCharacterMap(ids) {
  const unique = [...new Set(ids)].filter((id) => /^[0-9a-f]{24}$/i.test(id));
  const docs = await db
    .collection("characters")
    .find({ _id: { $in: unique.map(toObjectId) } })
    .toArray();
  return new Map(docs.map((doc) => [doc._id.toString(), doc]));
}

// Load every usable category, grouped by difficulty. Sorted by _id so a seeded
// random generator always sees the same input order (needed for the daily puzzle).
async function loadPools() {
  const all = await db
    .collection("catagories")
    .find({})
    .sort({ _id: 1 })
    .toArray();
  const characterMap = await getCharacterMap(
    all.flatMap((cat) => cat.characters ?? []),
  );

  // Ignore references to characters that no longer exist
  const byDifficulty = DIFFICULTIES.map(() => []);
  for (const cat of all) {
    const characters = (cat.characters ?? []).filter((id) =>
      characterMap.has(id),
    );
    if (
      DIFFICULTIES.includes(cat.difficulty) &&
      characters.length >= GROUP_SIZE
    ) {
      byDifficulty[cat.difficulty].push({ ...cat, characters });
    }
  }

  const missing = DIFFICULTIES.filter((d) => byDifficulty[d].length === 0);
  if (missing.length) {
    const names = ["Easy", "Medium", "Hard", "Extreme"];
    throw httpError(
      503,
      `Not enough categories to build a puzzle. Add at least one ${missing.map((d) => names[d]).join(", ")} category with ${GROUP_SIZE}+ characters.`,
    );
  }

  return { byDifficulty, characterMap };
}

// Try to pick one category per difficulty so that no character on the board fits more
// than one of the chosen categories (otherwise the puzzle would be ambiguous).
function pickPuzzle(byDifficulty, random) {
  const chosen = [];
  const onBoard = new Set(); // characters shown to the player
  const inChosen = new Set(); // every character belonging to a chosen category

  // Hardest first: those categories are usually the smallest pool
  for (const difficulty of [...DIFFICULTIES].reverse()) {
    let pick = null;
    for (const cat of shuffle(byDifficulty[difficulty], random)) {
      if (cat.characters.some((id) => onBoard.has(id))) continue;
      const available = cat.characters.filter((id) => !inChosen.has(id));
      if (available.length >= GROUP_SIZE) {
        pick = { cat, selected: shuffle(available, random).slice(0, GROUP_SIZE) };
        break;
      }
    }
    if (!pick) return null;

    pick.cat.characters.forEach((id) => inChosen.add(id));
    pick.selected.forEach((id) => onBoard.add(id));
    chosen[difficulty] = pick;
  }
  return chosen;
}

// Random choices can dead-end, so retry a few times before giving up
function buildPuzzle({ byDifficulty, characterMap }, random) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const chosen = pickPuzzle(byDifficulty, random);
    if (chosen) {
      return chosen.map(({ cat, selected }) => ({
        _id: cat._id,
        name: cat.name,
        difficulty: cat.difficulty,
        characters: selected.map((id) => characterMap.get(id)),
      }));
    }
  }
  throw httpError(
    503,
    "Couldn't build a puzzle without overlapping characters. Try adding more categories or characters.",
  );
}

// "YYYY-MM-DD" -> UTC midnight timestamp, or null if it isn't a real date
function parseDate(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date ?? "");
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const time = Date.UTC(y, m - 1, d);
  const parsed = new Date(time);
  if (
    parsed.getUTCFullYear() !== y ||
    parsed.getUTCMonth() !== m - 1 ||
    parsed.getUTCDate() !== d
  ) {
    return null;
  }
  return time;
}

// Random puzzle (practice mode)
category.get("/puzzle", async (req, res) => {
  res.status(200).json(buildPuzzle(await loadPools(), Math.random));
});

// Daily puzzle: the same for everyone on a given date. The client sends its local
// date, which is always within a day of the current UTC date in any timezone.
category.get("/daily", async (req, res) => {
  const time = parseDate(req.query.date);
  if (time === null) {
    throw httpError(400, "Expected a date like 2026-10-05");
  }

  const now = new Date();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  if (Math.abs(time - todayUtc) > DAY_MS) {
    throw httpError(400, "Only today's puzzle is available");
  }

  res.status(200).json(await getDailyPuzzle(req.query.date));
});

export default category;
