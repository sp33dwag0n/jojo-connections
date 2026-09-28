import express from "express";
import db from "../db/connection.js";
import verify from "../verify.js";
import { toObjectId, httpError } from "../util.js";


const character = express.Router();

function validateCharacter(body) {
    const name = String(body?.name ?? "").trim();
    const part = Number(body?.part);
    if (!name) throw httpError(400, "Name is required");
    if (!Number.isInteger(part) || part < 1) throw httpError(400, "Part must be a positive whole number");
    return { name, part };
}

// Get character list
character.get("/", verify, async (req, res) => {
    let characters = db.collection("characters");
    let results = await characters.find({}).sort({ part: 1, name: 1 }).toArray();
    res.status(200).json(results);
});

// Query one character
character.get("/:id", verify, async (req, res) => {
    let characters = db.collection("characters");
    let result = await characters.findOne({ _id: toObjectId(req.params.id) });

    if (!result) {
        return res.status(404).json({ message: "Character not found" });
    }
    res.status(200).json(result);
});

// Add character
character.post("/", verify, async (req, res) => {
    const newDocument = { ...validateCharacter(req.body), img: "" };

    let characters = db.collection("characters");
    let result = await characters.insertOne(newDocument);
    res.status(201).json(result);
});

// Update character
character.patch("/:id", verify, async (req, res) => {
    const query = { _id: toObjectId(req.params.id) };
    const updates = { $set: validateCharacter(req.body) };

    let characters = db.collection("characters");
    let result = await characters.updateOne(query, updates);
    if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Character not found" });
    }
    res.status(200).json(result);
});

// Delete character (and remove it from any catagories that reference it)
character.delete("/:id", verify, async (req, res) => {
    const query = { _id: toObjectId(req.params.id) };
    let result = await db.collection("characters").deleteOne(query);

    await db.collection("catagories").updateMany(
        { characters: req.params.id },
        { $pull: { characters: req.params.id } }
    );

    res.status(200).json(result);
});

export default character;
