import express from "express";
import db from "../db/connection.js";
import { toObjectId, shuffle } from "../util.js";


const catagory = express.Router();

const GROUP_SIZE = 4;
const DIFFICULTIES = [0, 1, 2, 3];

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

export default catagory;
