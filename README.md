# Assured Home Health Agency Dashboard

A professional management dashboard for Assured Home Health Agency. Track tasks, contacts, collaborations, reports, and automations.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase) ![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?logo=netlify)

## Features

- **Dashboard** — Overview cards, quick actions, recent activity
- **Tasks** — Kanban board + list view, CRUD, filter/sort, priority levels
- **Contacts** — Contact management with relationship types, search, link to tasks
- **Reports & Automations** — Track reports, automation run logs, status tracking
- **Collaborations** — Project tracking, activity logs, status management
- **Authentication** — Email/password via Supabase Auth, protected routes
- **Responsive** — Fully mobile-friendly with collapsible sidebar

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Netlify |
| Serverless | Netlify Functions |

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/nivaashford-cell/ahha-dashboard.git
cd ahha-dashboard
npm install
```

### 2. Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration file: `supabase/migrations/001_initial_schema.sql`
3. Copy your **Project URL** and **anon/public key** from Settings > API

### 3. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Locally

```bash
npm run dev
```

### 5. Deploy to Netlify

```bash
netlify deploy --prod
```

Set environment variables in Netlify dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Database Schema

| Table | Description |
|-------|-------------|
| `tasks` | Task management with status, priority, assignments |
| `contacts` | Contact/relationship management |
| `collaborations` | Project/initiative tracking |
| `collaboration_participants` | Link contacts to collaborations |
| `collaboration_tasks` | Link tasks to collaborations |
| `reports` | Report data and status tracking |
| `automation_logs` | Automation run history |
| `activity_log` | System-wide activity tracking |

## License

Private — Assured Home Health Agency
