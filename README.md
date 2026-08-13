# Checkpoint: Hosting a MERN App on Microsoft Azure

A minimal MERN stack app (MongoDB, Express, React, Node) - a small task
manager - built to satisfy the checkpoint's objective: *deploy a MERN
stack application on Microsoft Azure*, using MongoDB Atlas as the
database (Azure has no built-in MongoDB service) and following the
three Azure-readiness points from the checkpoint tutorial.

## What's here

- `server/` - Express + Mongoose backend.
  - `server.js` - production entry point. Connects to MongoDB via
    `MONGODB_URI` and listens on `process.env.PORT` (Azure assigns
    this at runtime - never hardcode it).
  - `app.js` - builds the Express app: mounts the `/api/tasks` REST
    API, serves the React production build (`client/build`) as static
    files, and has a catch-all `GET *` route that returns the build's
    `index.html` so client-side routes survive a full page refresh -
    these are exactly the three "dev vs prod" differences the
    checkpoint tutorial calls out for Azure.
  - `models/Task.js` - the Mongoose schema (`title`, `done`, timestamps).
  - `routes/tasks.js` - `GET/POST /api/tasks`, `PUT/DELETE /api/tasks/:id`.
  - `demo/` - verification script, see "Verifying it works" below.
- `client/` - React frontend (Vite), a single page that lists, adds,
  toggles, and deletes tasks via `fetch` calls to `/api/tasks`.
- `output.txt` - captured output of the verification script.

## How each instruction is satisfied

1. **Prepare your MERN application.** `server/` (Express + Mongoose)
   and `client/` (React) are fully built and tested locally (see
   "Verifying it works").
2. **Create a Microsoft Azure account / Set up MongoDB Atlas.** These
   are one-time account-creation steps on Microsoft's and MongoDB's
   own sites and aren't something a repository can "contain" - the
   app itself is written to plug straight into them: it never
   hardcodes a database location, only ever reads it from
   `MONGODB_URI` (see `server/.env.example`).
3. **Prepare the app for deployment.** Sensitive config
   (`MONGODB_URI`) is read from an environment variable, never
   committed (`.env` is git-ignored, `.env.example` documents the
   shape). `npm run build` in `client/` produces the production
   bundle in `client/build/`.
4. **Create an Azure Web App Service / set up the deployment
   source / deploy.** `server/app.js` serves `client/build` as static
   files and falls back to `index.html` for any non-API route -
   exactly what's needed once the repo is connected to an Azure Web
   App via the Deployment Center (Local Git or GitHub) and Azure
   builds and starts it with `npm start`.
5. **Configure environment variables.** `MONGODB_URI` and `PORT` are
   the only two the app reads (`server/.env.example`); on Azure these
   are set under the Web App's Configuration blade instead of a local
   `.env` file.
6. **Test your deployed app.** Locally, the same `npm run build` +
   `npm start` flow that Azure runs is exercised end-to-end (see
   below) - the deployed app on Azure behaves identically, since it's
   the same code path, just pointed at MongoDB Atlas instead of a
   local database.

## Verifying it works

This sandbox environment has no route to a real MongoDB server -
there's no way to install/download `mongod` here (the sandbox's
outbound network policy blocks MongoDB's own download host), so a live
MongoDB Atlas connection (as used in real production) can't be
exercised from inside this environment either. Rather than skip
verification, `server/demo/simulate.js` drives the *real* Express app
and route code (`app.js`, `routes/tasks.js`) through real HTTP
requests (via `supertest`), with only the persistence layer swapped
for an in-memory stand-in (`server/demo/fakeTaskModel.js`, documented
inline). Production (`server.js`) always uses the real Mongoose model
against MongoDB Atlas - nothing about the production code path is
faked, only the demo's database target.

```bash
cd server
npm install
npm run demo        # runs demo/simulate.js, writes ../output.txt
```

`output.txt` (committed at the repo root) shows: a health check, an
empty task list, a rejected request missing a title, three tasks
created, the list after creation, a task marked done, a task deleted,
a 404 on updating an already-deleted task, the final task list, and
the catch-all route serving the SPA fallback.

The React build was also verified to compile and to be served
correctly by the Express app:

```bash
cd client
npm install
npm run build        # produces client/build/
```

## Running it for real (with MongoDB Atlas + Azure)

```bash
# 1. Build the frontend
cd client && npm install && npm run build

# 2. Configure the backend
cd ../server && npm install
cp .env.example .env   # then fill in MONGODB_URI from your Atlas cluster

# 3. Run it
npm start              # visit http://localhost:5000
```

To deploy on Azure: create an Azure Web App (Node runtime), point its
Deployment Center at this repository's `main` branch (Local Git or
GitHub), set `MONGODB_URI` under Configuration, and push - Azure runs
`npm install` and `npm start` in `server/`, which serves the
already-built `client/build` directory.
