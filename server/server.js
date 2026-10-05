import express from "express";
import cors from "cors";
import catagory from "./routes/catagory.js";

if (!process.env.ATLAS_URI) {
    console.error("ATLAS_URI is not set. Start the server with: npm start (reads server.env)");
    process.exit(1);
}

const PORT = process.env.PORT || 5050;
const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ?.split(",")
    .map(origin => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

// Public, read-only API for the game. Admin/write routes live in the JojoConnectionsAdmin project.
app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : true }));
app.use("/catagory", catagory);

// Express 5 forwards errors from async handlers here
app.use((err, req, res, next) => {
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ message: err.expose ? err.message : "Internal server error" });
});

// Start the express server
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

export default app;
