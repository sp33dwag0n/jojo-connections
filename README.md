# JoJo Connections

A JoJo's Bizarre Adventure take on NYT Connections: find four groups of four characters.

- `Server/` — Express 5 + MongoDB API. Public and read-only: just `GET /catagory/puzzle`.
- `Admin/` — React 19 + Vite + Tailwind CSS v4 frontend for the game. (Despite the folder name, this is the game UI.)

Managing characters and categories is done in the separate
[JojoConnectionsAdmin](../JojoConnectionsAdmin) project, which uses the same database.

## Requirements

Node.js 20.6 or newer (for `--env-file`).

## Running

Server (reads `Server/server.env`, which needs `ATLAS_URI` and optionally `PORT`):

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
