<p align="center">
  <img src="frontend/public/logo_wordmark.png" alt="PersonaLens" width="320" />
</p>


<p align="center">
  AI-assisted academic readiness, mock interview practice, personality insight, and mentor-ready result reporting for college placement workflows.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111827" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwindcss&logoColor=white" />
  <img alt="Radix UI" src="https://img.shields.io/badge/Radix_UI-Primitives-161618?logo=radixui&logoColor=white" />
  <img alt="Framer Motion" src="https://img.shields.io/badge/Framer_Motion-11-0055FF?logo=framer&logoColor=white" />
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white" />
  <img alt="PostgreSQL Ready" src="https://img.shields.io/badge/PostgreSQL-Ready-4169E1?logo=postgresql&logoColor=white" />
</p>

## Overview

PersonaLens is a modular academic intelligence platform for students, mentors, and placement teams. It helps a student upload or paste resume context, add a target job description, generate focused interview questions, practice responses, capture readiness signals, and export a structured result report.

The project is organized as a scalable full-stack app:

- `frontend/` contains the React, TypeScript, Vite, Tailwind, Radix UI, Framer Motion, Recharts, and face-api.js workspace.
- `backend/` contains the FastAPI service, typed schemas, AI analysis routes, interview preparation routes, auth routes, and local persistence layer.
- `pipeline/` is reserved for research and build artifacts. Large docs, notebooks, PDFs, DOCX files, and ZIP exports are ignored for GitHub hygiene.

## Features

- Student landing page with a guided assessment launch flow.
- Resume and job-description intake for targeted mock interview preparation.
- Question generation and gap-map workflow powered through the FastAPI preparation service.
- Browser speech transcript capture and optional camera-based facial-expression sampling.
- Multimodal assessment workspace with global sidebar navigation.
- Result dashboard with OCEAN-style traits, readiness score, strengths, development areas, and comparison-ready history.
- PDF export for mentor review and placement-cell records.
- Auth UI and API layer for sign up, sign in, Google-style handoff, OTP password reset, change password, saved results, and profile history.
- PostgreSQL-ready configuration through `DATABASE_URL`, with local development storage available by default.

## Tech Stack

Frontend:

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI primitives
- Framer Motion
- Recharts
- Lucide React
- face-api.js
- Sonner

Backend:

- FastAPI
- Uvicorn
- Pydantic
- python-dotenv
- Google GenAI SDK
- PostgreSQL-ready driver via `psycopg`

## Project Structure

```text
PersonaLens/
|-- frontend/
|   |-- public/
|   |   |-- logo.png
|   |   |-- logo_name.png
|   |   |-- logo_wordmark.png
|   |   |-- college_pic.webp
|   |   `-- models/
|   |-- src/
|   |   |-- components/
|   |   |-- data/
|   |   |-- hooks/
|   |   |-- lib/
|   |   |-- types/
|   |   `-- utils/
|   |-- package.json
|   |-- tailwind.config.js
|   |-- tsconfig.json
|   `-- vite.config.ts
|-- backend/
|   |-- app/
|   |   |-- api/routes/
|   |   |-- core/
|   |   |-- schemas/
|   |   |-- services/
|   |   `-- main.py
|   |-- main.py
|   |-- requirements.txt
|   `-- .env.example
`-- pipeline/
```

## Environment

Create the backend environment file:

```powershell
cd backend
copy .env.example .env
```

Set these values when needed:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro
DATABASE_URL=postgresql://persona_lens:persona_lens@localhost:5432/persona_lens
```

Without a Gemini key, the app can still run with deterministic fallback analysis for local testing.

## Run Locally

Start the backend in one terminal:

```powershell
cd backend
..\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Backend URL:

```text
http://localhost:8000
```

Start the frontend in another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Quality Checks

Run frontend type checks:

```powershell
cd frontend
npm run typecheck
```

Create a production build:

```powershell
cd frontend
npm run build
```

Compile backend Python files:

```powershell
python -m compileall backend\app backend\main.py
```

## API Surface

Health:

- `GET /`
- `GET /health`
- `GET /api/v1/health`

Assessment:

- `POST /api/v1/prepare`
- `POST /api/v1/analyze`
- `POST /analyze`

Auth and results:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/google`
- `POST /api/v1/auth/request-otp`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/change-password`
- `GET /api/v1/auth/me`
- `POST /api/v1/reports`
- `GET /api/v1/reports`

Example analysis payload:

```json
{
  "name": "Candidate Name",
  "program": "B.Tech CSE",
  "assessmentTrack": "Placement readiness",
  "turns": [
    {
      "question": "Tell me about a project you are proud of.",
      "answer": "I built a placement-preparation tool with a React frontend and FastAPI backend.",
      "category": "Project Depth",
      "emotions": []
    }
  ]
}
```

## GitHub Hygiene

The `.gitignore` excludes local environments, build outputs, caches, runtime databases, logs, editor settings, generated docs, PDFs, DOCX files, ZIP exports, and pipeline notebooks. Keep source code, public assets required by the app, package manifests, and backend schemas/services committed.

## Roadmap

- Connect production PostgreSQL persistence.
- Replace local auth handoff with a real OAuth provider.
- Add institution-level dashboards for cohorts and placement teams.
- Promote pipeline notebooks into versioned backend services.
- Add audit logs, consent records, and admin review flows.
