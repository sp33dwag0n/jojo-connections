import express from "express";
import db from "../db/connection.js";
import verify from "../verify.js";
import { toObjectId, httpError, shuffle } from "../util.js";


const catagory = express.Router();

const GROUP_SIZE = 4;
const DIFFICULTIES = [0, 1, 2, 3];

function validateCatagory(body) {
    const name = String(body?.name ?? "").trim();
    const difficulty = Number(body?.difficulty);
    const characters = Array.isArray(body?.characters) ? [...new Set(body.characters.map(String))] : [];
    if (!name) throw httpError(400, "Name is required");
    if (!DIFFICULTIES.includes(difficulty)) throw httpError(400, "Difficulty must be 0-3");
    if (characters.length < GROUP_SIZE) throw httpError(400, `Pick at least ${GROUP_SIZE} characters`);
    characters.forEach(toObjectId);
    return { name, characters, difficulty };
}

// Map of character id string -> character document
async function getCharacterMap(ids) {
    const unique = [...new Set(ids)].filter(id => /^[0-9a-f]{24}$/i.test(id));
    const docs = await db.collection("characters")
        .find({ _id: { $in: unique.map(toObjectId) } })
        .toArray();
    return new Map(docs.map(doc => [doc._id.toString(), doc]));
}

// Try to pick one catagory per difficulty so that no character on the board fits more
// than one of the chosen catagories (otherwise the puzzle would be ambiguous).
function pickPuzzle(byDifficulty) {
    const chosen = [];
    const onBoard = new Set();       // characters shown to the player
    const inChosen = new Set();      // every character belonging to a chosen catagory

    // Hardest first: those catagories are usually the smallest pool
    for (const difficulty of [...DIFFICULTIES].reverse()) {
        let pick = null;
        for (const cat of shuffle(byDifficulty[difficulty])) {
            if (cat.characters.some(id => onBoard.has(id))) continue;
            const available = cat.characters.filter(id => !inChosen.has(id));
            if (available.length >= GROUP_SIZE) {
                pick = { cat, selected: shuffle(available).slice(0, GROUP_SIZE) };
                break;
            }
        }
        if (!pick) return null;

        pick.cat.characters.forEach(id => inChosen.add(id));
        pick.selected.forEach(id => onBoard.add(id));
        chosen[difficulty] = pick;
    }
    return chosen;
}

// Make puzzle
catagory.get("/puzzle", async (req, res) => {
    const all = await db.collection("catagories").find({}).toArray();
    const characterMap = await getCharacterMap(all.flatMap(cat => cat.characters ?? []));

    // Ignore references to characters that no longer exist
    const byDifficulty = DIFFICULTIES.map(() => []);
    for (const cat of all) {
        const characters = (cat.characters ?? []).filter(id => characterMap.has(id));
        if (DIFFICULTIES.includes(cat.difficulty) && characters.length >= GROUP_SIZE) {
            byDifficulty[cat.difficulty].push({ ...cat, characters });
        }
    }

    const missing = DIFFICULTIES.filter(d => byDifficulty[d].length === 0);
    if (missing.length) {
        const names = ["Easy", "Medium", "Hard", "Extreme"];
        return res.status(503).json({
            message: `Not enough catagories to build a puzzle. Add at least one ${missing.map(d => names[d]).join(", ")} catagory with ${GROUP_SIZE}+ characters.`
        });
    }

    // Random choices can dead-end, so retry a few times before giving up
    for (let attempt = 0; attempt < 50; attempt++) {
        const chosen = pickPuzzle(byDifficulty);
        if (chosen) {
            const results = chosen.map(({ cat, selected }) => ({
                _id: cat._id,
                name: cat.name,
                difficulty: cat.difficulty,
                characters: selected.map(id => characterMap.get(id)),
            }));
            return res.status(200).json(results);
        }
    }

    res.status(503).json({
        message: "Couldn't build a puzzle without overlapping characters. Try adding more catagories or characters."
    });
});

// Get catagory list
catagory.get("/", verify, async (req, res) => {
    let results = await db.collection("catagories").find({}).sort({ difficulty: 1, name: 1 }).toArray();
    const characterMap = await getCharacterMap(results.flatMap(cat => cat.characters ?? []));

    results.forEach(cat => {
        cat.characterNames = (cat.characters ?? []).map(id => characterMap.get(id)?.name ?? "(deleted)");
    });

    res.status(200).json(results);
});

// Query one catagory
catagory.get("/:id", verify, async (req, res) => {
    let result = await db.collection("catagories").findOne({ _id: toObjectId(req.params.id) });

    if (!result) {
        return res.status(404).json({ message: "Catagory not found" });
    }

    // Keep names in the same order as the ids, and drop ids whose character was deleted
    const characterMap = await getCharacterMap(result.characters ?? []);
    result.characters = (result.characters ?? []).filter(id => characterMap.has(id));
    result.characterNames = result.characters.map(id => characterMap.get(id).name);

    res.status(200).json(result);
});

// Add catagory
catagory.post("/", verify, async (req, res) => {
    let result = await db.collection("catagories").insertOne(validateCatagory(req.body));
    res.status(201).json(result);
});

// Update catagory
catagory.patch("/:id", verify, async (req, res) => {
    const query = { _id: toObjectId(req.params.id) };
    const updates = { $set: validateCatagory(req.body) };

    let result = await db.collection("catagories").updateOne(query, updates);
    if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Catagory not found" });
    }
    res.status(200).json(result);
});

// Delete catagory
catagory.delete("/:id", verify, async (req, res) => {
    let result = await db.collection("catagories").deleteOne({ _id: toObjectId(req.params.id) });
    res.status(200).json(result);
});

export default catagory;
