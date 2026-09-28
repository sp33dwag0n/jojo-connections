# JoJo Connections

A JoJo's Bizarre Adventure take on NYT Connections: find four groups of four characters.

- `Server/` — Express 5 + MongoDB API (puzzle generation, admin CRUD, JWT auth)
- `Admin/` — React 19 + Vite + Tailwind CSS v4 frontend (the game at `/`, admin panel at `/admin`)

## Requirements

Node.js 22.22 or newer (the frontend's router needs it; the server alone needs 20.6+ for `--env-file`).

## Running

Server (reads `Server/server.env`, which needs `ATLAS_URI`, `JWT_SECRET`, and optionally `PORT`):

```
cd Server
npm install
npm start        # or: npm run dev   (restarts on file changes)
```

Frontend:

```
cd Admin
npm install
npm run dev
```

The frontend talks to `http://localhost:5050` by default. To point it elsewhere, create `Admin/.env.local` with
`VITE_API_URL=https://your-server`.

## Admin accounts

`POST /admin/register` with `{ "username", "password" }` works without a token only while there are no admins.
After that, registering a new admin requires an existing admin's token.
