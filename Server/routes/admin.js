import express from "express";
import db from "../db/connection.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const admin = express.Router();

admin.post("/login", async (req, res) => {
    const { username, password } = req.body;
    let collection = db.collection("admin");
    let login = await collection.findOne({ username });

    if (login) {
        const isValid = await bcrypt.compare(password, login.password);
        if (isValid) {
            const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token })
        } else {
            res.status(401).json({ message: 'Invalid Credentials' });
        }
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

admin.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // Check if the user already exists
    let collection = db.collection("admin");
    let existingUser = await collection.findOne({ username });

    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds

    // Insert the new user with the hashed password into the database
    await collection.insertOne({
        username,
        password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });
});


export default admin;