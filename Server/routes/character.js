import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";
import verify from "../verify.js";


const character = express.Router();

// Get character list
character.get("/", verify, async (req, res) => {
    let characters = db.collection("characters");
    let results = await characters.find({}).toArray();
    res.send(results).status(200);
});

// Query one character
character.get("/:id", verify, async (req, res) => {
    let characters = db.collection("characters");
    let query = { _id: ObjectId.createFromHexString(req.params.id) };
    let result = await characters.findOne(query);

    if (!result) {
        res.send("Character not found").status(404);
    } else {
        res.send(result).status(200);
    }
});

// Add character
character.post("/", verify, async (req, res) => {
    try {
        let newDocument = {
            name: req.body.name,
            part: Number(req.body.part),
            img: ""
        };

        let characters = db.collection("characters");
        let result = await characters.insertOne(newDocument);
        res.send(result).status(204);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding character");
    }
});

// Update character
character.patch("/:id", verify, async (req, res) => {
    try {
        const query = { _id: ObjectId.createFromHexString(req.params.id) };
        const updates = {
            $set: {
                name: req.body.name,
                part: Number(req.body.part),
                img: ""
            }
        };

        let characters = db.collection("characters");
        let result = await characters.updateOne(query, updates);
        res.send(result).status(200);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating character")
    }
});

// Delete character
character.delete("/:id", verify, async (req, res) => {
    try {
        const characters = db.collection("characters");
        const query = { _id: ObjectId.createFromHexString(req.params.id) };
        let result = await characters.deleteOne(query);

        const catagories = await db.collection("catagories");
        const catagoryQuery = { characters: req.params.id };
        let catagoriesResult = await catagories.find(catagoryQuery).toArray();

        for (let i = 0; i < catagoriesResult.length; i++) {
            let index = catagoriesResult[i].characters.indexOf(req.params.id);
            catagoriesResult[i].characters.splice(index, 1);
            const updates = {
                $set: {
                    characters: catagoriesResult[i].characters,
                }
            };

            let updateQuery = { _id: catagoriesResult[i]._id };
            await catagories.updateOne(updateQuery, updates);
        }
        
        res.send(result).status(200);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting character")
    }
});

export default character;