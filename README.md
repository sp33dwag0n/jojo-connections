# JOJO Connections

A JoJo's Bizarre Adventure take on NYT Connections: find four groups of four characters.

- `server/` — Express 5 + MongoDB API. Public and read-only: just `GET /category/puzzle`.
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

The frontend talks to `http://localhost:5050` by default. To point it elsewhere, create `client/.env.local` with
`VITE_API_URL=https://your-server`.
