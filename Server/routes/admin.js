import express from "express";
import db from "../db/connection.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const admin = express.Router();

admin.get("/login", async (req, res) => {
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


export default admin;