# Weekly Report Generator & Team Dashboard

A full-stack web app where team members submit structured weekly work reports, and managers view and analyze those reports across the whole team through a consolidated dashboard.

Built for the SE Internship Technical Assignment.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| State | React Context |
| Backend | Node.js + Express |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcrypt |
| Charts | Recharts |
| AI Assistant | Google Gemini API (`gemini-flash-latest`) |

## Features

- **Authentication & Roles** — register/login, JWT sessions, `member` and `manager` roles with role-based access control on the backend
- **Personal Weekly Report Page** — fixed 7-field report structure (week range, project, tasks completed, tasks planned, blockers, hours, notes), create/edit/submit, view own history
- **Projects/Categories CRUD** — manager-only create/edit/delete, all authenticated users can view
- **Team Dashboard** — summary metrics, submission status per member, workload by project, reports trend over time, recent activity feed, filters (member/project/date range)
- **AI Chat Assistant** — Gemini-powered Q&A grounded in real report data, plus a one-click AI weekly team summary

## Project Structure

```
weekly-report-app/
├── backend/          Express API (see backend/README.md for backend-only setup)
│   ├── config/       MongoDB connection
│   ├── models/       User, Project, Report (Mongoose schemas)
│   ├── middleware/   JWT auth (protect) + role-based access (authorize)
│   ├── controllers/  Route handlers (auth, projects, reports, ai)
│   ├── routes/       Express routers
│   └── server.js     App entry point
└── frontend/         Next.js 14 App Router frontend
    ├── app/          Pages: /login, /register, /reports, /dashboard
    ├── components/   Reusable UI (forms, charts, chat widget, filters)
    ├── context/       AuthContext (session state)
    └── lib/           API client + date utilities
```

## Setup

### 1. Prerequisites
- Node.js 18+ (for built-in `fetch`, used by the Gemini integration)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster
- A free [Gemini API key](https://aistudio.google.com/apikey)

### 2. Clone and install
```bash
git clone <your-repo-url>
cd weekly-report-app

cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment variables

**`backend/.env`** (copy from `backend/.env.example`):
```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=a_long_random_string
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
```

**`frontend/.env.local`**:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Run the database
Nothing to run locally — MongoDB Atlas is a managed cloud database. Just make sure your `MONGO_URI` is correct and your IP is allow-listed in Atlas Network Access.

### 5. Run the backend
```bash
cd backend
npm run dev
```
Runs on `http://localhost:5000`.

### 6. Run the frontend
```bash
cd frontend
npm run dev
```
Runs on `http://localhost:3000`.

### 7. Try it out
1. Go to `http://localhost:3000/register`
2. Create a **Manager** account and a **Team Member** account
3. As the manager, create a project (via API or extend the UI — see "Known limitations" below)
4. As the team member, submit a weekly report against that project
5. As the manager, view the dashboard, filter reports, and try the AI chat assistant

## API Overview

All endpoints are prefixed with `/api`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register (role: member/manager) |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/me` | Authenticated | Current user info |
| GET | `/auth/members` | Manager | List team members (for filters) |
| GET/POST | `/projects` | Auth / Manager | List / create projects |
| PUT/DELETE | `/projects/:id` | Manager | Edit / delete a project |
| GET/POST | `/reports/me` | Member | Own report history / create report |
| PUT | `/reports/:id` | Owner | Edit own report |
| PATCH | `/reports/:id/submit` | Owner | Submit a draft report |
| GET | `/reports/team` | Manager | Team reports with filters |
| GET | `/reports/team/status` | Manager | Submission status per member for a week |
| POST | `/ai/chat` | Manager | Ask the AI assistant a question |
| POST | `/ai/summary` | Manager | Generate an AI weekly team summary |

## Data Privacy Note (AI Assistant)

The AI assistant only receives **submitted** reports (never drafts), and only sends the fields needed to answer questions (member name, project, tasks, blockers, hours) — email addresses and other account details are never sent to the Gemini API.

## Known Limitations / Future Improvements
- Project creation currently has no dedicated UI (tested via API); a manager-facing "Manage Projects" page would be a natural next addition
- Submission "late" status uses a simple fixed-day threshold rather than configurable per-team deadlines
- No file/link attachment upload for reports beyond a plain-text notes field
- No email notifications for pending/late submissions

## License
Built for educational/assignment purposes.