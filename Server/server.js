import express from "express";
import cors from "cors";
import character from "./routes/character.js"
import catagory from "./routes/catagory.js";
import admin from "./routes/admin.js";

if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set. Start the server with: npm start (reads server.env)");
    process.exit(1);
}

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/character", character);
app.use("/catagory", catagory);
app.use("/admin", admin);

// Express 5 forwards errors from async handlers here
app.use((err, req, res, next) => {
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ message: err.expose ? err.message : "Internal server error" });
});

// Start the express server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
