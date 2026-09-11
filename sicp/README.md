# Societal Innovation Collaboration Portal (SICP)

A full-stack implementation of Problem Statement 26043 (Govt. of Jharkhand, Dept. of Higher & Technical Education):
citizens report local problems → AI suggests a category → government reviews and routes to a university →
the university forms a team and requests an industry partner → the partner proposes a timeline, resources and
budget → government approves the budget → ground work is tracked to completion → the impact created is
published for citizens to see. A bilingual (English/Hindi) assistant chatbot with voice input and read-aloud
is built in throughout.

This is a real client-server application — a Node/Express API backed by MongoDB with password
authentication (bcrypt + JWT), and a React frontend that talks to it over HTTP. It is not a mock/demo with
fake in-memory state.

## What's genuinely production-shaped here
- Real user accounts (bcrypt password hashing, JWT sessions), 4 roles with server-side permission checks
- MongoDB (Mongoose) with users, problems, and organisations collections
- A REST API with one endpoint per workflow action, each validating role + current stage before acting
- A React SPA that reads/writes only through that API — refresh the page and your data is still there
- Dockerfiles for both services + docker-compose (including MongoDB) to run the whole thing with one command
- `render.yaml` Blueprint for deploying the API and static frontend on Render

## What is still a simplification, on purpose
- The AI categoriser is a transparent keyword-matching classifier, not a trained NLP model — swap
  `server/src/utils/aiClassify.js` for a call to a real model/API when you have one.
- Only interface chrome is translated into Hindi; user-typed problem descriptions are not machine-translated.
- Photo/video upload is a UI placeholder (no file storage wired up yet) — add S3/Cloud Storage + multer for that.
- No file was executed inside a Docker container in the environment I built this in (no Docker available there),
  so test `docker compose up` locally before you rely on it for a real deployment.

---

## Project layout

```
sicp/
  server/     Express API + MongoDB (Mongoose)
  client/     React (Vite) frontend
  docker-compose.yml
  render.yaml
```

## Run it locally (no Docker)

**MongoDB** must be running locally (or use a MongoDB Atlas connection string).

**Backend**
```bash
cd server
npm install
cp .env.example .env    # set MONGODB_URI and JWT_SECRET
npm start                # listens on http://localhost:4000
```

**Frontend** (separate terminal)
```bash
cd client
npm install
npm run dev               # http://localhost:5173, proxies /api to localhost:4000
```

On first run, the server seeds:
- 5 universities and 6 industry partners (matched to problem categories automatically)
- 4 demo accounts, password `password123` for all:
  - `citizen@demo.gov.in`
  - `government@demo.gov.in`
  - `university@demo.gov.in` (BIT Mesra)
  - `industry@demo.gov.in` (Jharkhand IoT Systems)
- 4 sample problems already at different pipeline stages, including one completed one with published impact

New citizens/universities/industry partners/government users can also register from the login screen.

## Run it with Docker Compose

```bash
cp .env.example .env    # optional, sets JWT_SECRET for the compose file
docker compose up --build
```
- Frontend: http://localhost:8080
- Backend API: http://localhost:4000
- MongoDB persists in a named Docker volume (`sicp-mongo`)

## Deploy on Render + MongoDB Atlas

Render does not host MongoDB. Use a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster, then two Render services (API + static site).

### 1. MongoDB Atlas

1. Create a free M0 cluster.
2. **Database Access** → add a user (username + password).
3. **Network Access** → allow `0.0.0.0/0` so Render can connect (Render IPs change).
4. **Connect** → Drivers → copy the URI, set the database name to `sicp`:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/sicp?retryWrites=true&w=majority`

### 2. Push this project to GitHub

The Blueprint file is `render.yaml` at the repository root (expects a `sicp/` folder). If GitHub only contains the `sicp` folder, use `sicp/render.yaml` instead (Root Directory `server` / `client`).

### 3. API (Web Service)

Dashboard → **New** → **Web Service** (or **Blueprint**).

| Setting | Value |
|---|---|
| Root Directory | `sicp/server` |
| Runtime | Node |
| Build command | `npm install` |
| Start command | `npm start` |
| Health check | `/api/health` |

Environment variables:

| Key | Value |
|---|---|
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | long random string |
| `CLIENT_ORIGIN` | frontend URL, e.g. `https://sicp-web.onrender.com` (you can add this after the static site exists) |
| `NODE_VERSION` | `20` |

`PORT` is set by Render automatically.

### 4. Frontend (Static Site)

Dashboard → **New** → **Static Site**.

| Setting | Value |
|---|---|
| Root Directory | `sicp/client` |
| Build command | `npm install && npm run build` |
| Publish directory | `dist` |

Environment variable (must be present **at build time**):

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://YOUR-API-SERVICE.onrender.com/api` |

Then set `CLIENT_ORIGIN` on the API to `https://YOUR-STATIC-SITE.onrender.com` and redeploy the API if needed.

The first Render request after idle can take ~30s (free-tier spin-up). Demo logins still use password `password123`.

**Before going live**, at minimum:
1. Replace the demo accounts / reseed with real ones (`server/src/db.js`)
2. Put a real AI/NLP classifier behind `aiClassify.js`
3. Add file upload storage for citizen photos/videos
4. Put HTTPS in front of both services (Render does this by default)

## API summary

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | /api/auth/register | any | create an account |
| POST | /api/auth/login | any | get a JWT |
| GET | /api/problems | any (auth'd) | list problems, scoped to what that role should see |
| POST | /api/problems | citizen | submit a problem (AI-categorised automatically) |
| POST | /api/problems/:id/approve | government | approve & route to a university |
| POST | /api/problems/:id/reject | government | reject with a reason |
| POST | /api/problems/:id/form-team | university | accept + form a team |
| POST | /api/problems/:id/request-industry | university | request an industry partner |
| POST | /api/problems/:id/submit-proposal | industry | submit timeline/resources/budget |
| POST | /api/problems/:id/approve-budget | government | approve budget, ground work starts |
| POST | /api/problems/:id/reject-budget | government | send budget back for revision |
| POST | /api/problems/:id/resubmit | university | request a revised industry proposal |
| POST | /api/problems/:id/progress | university/industry | update ground-work progress |
| POST | /api/problems/:id/complete | university | mark done + publish impact |
| GET | /api/problems/public/impact | public | completed problems + impact, for the citizen gallery |
| POST | /api/chatbot | any | bilingual assistant reply |
