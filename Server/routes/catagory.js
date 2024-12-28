import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";


const catagory = express.Router();

// Make puzzle
catagory.get("/puzzle", async (req, res) => {
    let catagories = await db.collection("catagories");
    let characters = await db.collection("characters");

    let extreme = await catagories.aggregate([
        {$match: { difficulty: 3 }},
        {$sample: { size: 1 }}
    ]).toArray();
    extreme = extreme[0];
    extreme.characters = extreme.characters.sort(() => 0.5 - Math.random()).slice(0, 4);
    
    let hard = await catagories.aggregate([
        {$match: { difficulty: 2, characters: { $not: { $elemMatch: { $in: extreme.characters } } } }}
    ]).toArray();
    hard = hard.sort(() => 0.5 - Math.random());
    for (let i = 0; i < hard.length; i++) {
        hard[i].characters = hard[i].characters.filter(value => !extreme.characters.includes(value));
        if (hard[i].characters.length >= 4) {
            hard[i].characters = hard[i].characters.sort(() => 0.5 - Math.random());
            hard[i].characters = hard[i].characters.slice(0, 4);
            hard = hard[i];
            break;
        }
    }

    let medium = await catagories.aggregate([
        {$match: { difficulty: 1, characters: { $not: { $elemMatch: { $in: extreme.characters, $in: hard.characters } } } }}
    ]).toArray();
    medium = medium.sort(() => 0.5 - Math.random());
    for (let i = 0; i < medium.length; i++) {
        medium[i].characters = medium[i].characters.filter(value => !extreme.characters.includes(value) && !hard.characters.includes(value));
        if (medium[i].characters.length >= 4) {
            medium[i].characters = medium[i].characters.sort(() => 0.5 - Math.random());
            medium[i].characters = medium[i].characters.slice(0, 4);
            medium = medium[i];
            break;
        }
    }

    let easy = await catagories.aggregate([
        {$match: { difficulty: 0, characters: { $not: { $elemMatch: { $in: extreme.characters, $in: hard.characters, $in: medium.characters } } } }}
    ]).toArray();
    easy = easy.sort(() => 0.5 - Math.random());
    for (let i = 0; i < easy.length; i++) {
        easy[i].characters = easy[i].characters.filter(value => !extreme.characters.includes(value) && !hard.characters.includes(value) && !medium.characters.includes(value));
        if (easy[i].characters.length >= 4) {
            easy[i].characters = easy[i].characters.sort(() => 0.5 - Math.random());
            easy[i].characters = easy[i].characters.slice(0, 4);
            easy = easy[i];
            break;
        }
    }

    let extremeCharacters = [];
    let hardCharacters = [];
    let mediumCharacters = [];
    let easyCharacters = [];
    for (let i = 0; i < 4; i++) {
        extremeCharacters[i] = await characters.findOne({ _id: ObjectId.createFromHexString(extreme.characters[i]) });
        hardCharacters[i] = await characters.findOne({ _id: ObjectId.createFromHexString(hard.characters[i]) });
        mediumCharacters[i] = await characters.findOne({ _id: ObjectId.createFromHexString(medium.characters[i]) });
        easyCharacters[i] = await characters.findOne({ _id: ObjectId.createFromHexString(easy.characters[i]) });
    }
    easy.characters = easyCharacters;
    medium.characters = mediumCharacters;
    hard.characters = hardCharacters;
    extreme.characters = extremeCharacters;
    
    let results = [easy, medium, hard, extreme];
    res.send(results).status(200);
});

// Get catagory list
catagory.get("/", async (req, res) => {
    let catagories = await db.collection("catagories");
    let results = await catagories.find({}).toArray(); 
    let characters = await db.collection("characters");
    
    let length = results.length
    for (let i = 0; i < length; i++) {
        let characterNameArray = [];
        for (let j = 0; j < results[i].characters.length; j++) {
            let query = { _id: ObjectId.createFromHexString(results[i].characters[j]) };
            let singleCharacter = await characters.findOne(query);
            characterNameArray[j] = singleCharacter.name;
        }
        results[i].characterNames = characterNameArray;
    }
    res.send(results).status(200);
});

// Query one catagory
catagory.get("/:id", async (req, res) => {
    let catagories = await db.collection("catagories");
    let query = { _id: ObjectId.createFromHexString(req.params.id) };
    let result = await catagories.findOne(query);

    if (!result) {
        res.send("Catagory not found").status(404);
    }

    let characters = await db.collection("characters");
    let characterNameArray = [];
    for (let i = 0; i < result.characters.length; i++) {
        let catagoryQuery = { _id: ObjectId.createFromHexString(result.characters[i]) };
        let singleCharacter = await characters.findOne(catagoryQuery);
        characterNameArray[i] = singleCharacter.name;
    }
    result.characterNames = characterNameArray;

    res.send(result).status(200);
});

// Add catagory
catagory.post("/", async (req, res) => {
    try {
        let newDocument = {
            name: req.body.name,
            characters: req.body.characters,
            difficulty: Number(req.body.difficulty)
        };

        let catagories = await db.collection("catagories");
        let result = await catagories.insertOne(newDocument);
        res.send(result).status(204);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding catagory");
    }
});

// Update catagory
catagory.patch("/:id", async (req, res) => {
    try {
        const query = { _id: ObjectId.createFromHexString(req.params.id) };
        const updates = {
            $set: {
                name: req.body.name,
                characters: req.body.characters,
                difficulty: Number(req.body.difficulty)
            }
        };

        let catagories = await db.collection("catagories");
        let result = await catagories.updateOne(query, updates);
        res.send(result).status(200);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating catagory")
    }
});

// Delete catagory
catagory.delete("/:id", async (req, res) => {
    try {
        const query = { _id: ObjectId.createFromHexString(req.params.id) };

        const catagories = await db.collection("catagories");
        let result = await catagories.deleteOne(query);
        res.send(result).status(200);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting catagory")
    }
});

export default catagory;