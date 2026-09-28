import express from "express";
import db from "../db/connection.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import verify from "../verify.js";


const admin = express.Router();

admin.post("/login", async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    let collection = db.collection("admin");
    let login = await collection.findOne({ username });

    // Same response for unknown user and wrong password so usernames can't be probed
    if (!login || !(await bcrypt.compare(password, login.password))) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// The first admin can register freely; after that, registering requires an admin's token
const registerGuard = async (req, res, next) => {
    const count = await db.collection("admin").countDocuments({}, { limit: 1 });
    if (count === 0) return next();
    return verify(req, res, next);
};

admin.post("/register", registerGuard, async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

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
