# JOJO Connections

A JoJo's Bizarre Adventure take on NYT Connections: find four groups of four characters.

- `server/` — Express 5 + MongoDB API. Public and read-only: `GET /puzzle` (random) and `GET /puzzle/daily?date=YYYY-MM-DD`.
- `client/` — React 19 + Vite + Tailwind CSS v4 frontend for the game.

## Requirements

Node.js 20.6 or newer (for `--env-file`).

## Running

Server (reads `server/server.env`, which needs `ATLAS_URI` and optionally `PORT`):

```
cd server
npm install
npm start        # or: npm run dev   (restarts on file changes)
```

Frontend:

```
cd client
npm install
npm run dev
```

The frontend always fetches puzzles from the hosted API (`https://jojo-connections-api.vercel.app/puzzle`),
so running the server locally is only needed when working on the server itself.
