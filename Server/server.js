import express from "express";
import cors from "cors";
import character from "./routes/character.js"
import catagory from "./routes/catagory.js";
import admin from "./routes/admin.js";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/character", character);
app.use("/catagory", catagory);
app.use("/admin", admin);

// Start the express server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});