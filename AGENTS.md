# AGENTS.md - HackArena Scanner

## Project Structure

```
scanner/
├── backend/            # Express.js + SQLite (port 5000)
│   ├── src/
│   │   ├── index.js       # Entry point
│   │   ├── database.js    # SQLite setup with better-sqlite3
│   │   └── routes/        # API routes (teams, judges, evaluations)
│   └── .env               # PORT, DATABASE_NAME
└── frontend/           # React 18 + Vite (port 5173)
    └── src/
        ├── pages/          # ScannerPage, TeamsPage, JudgesPage, ResultsPage
        └── utils/api.js   # API client
```

## Developer Commands

```bash
# From root:
npm run install:all  # Install all dependencies
npm run dev         # Start frontend (Vite on 5173)
npm run build       # Build frontend for production
npm run start      # Start backend (Express on 5000)

# From backend/:
npm run dev        # Watch mode
npm run start      # Production start

# From frontend/:
npm run dev        # Vite dev server
npm run build     # Vite build
```

## Setup Requirements

1. Run `npm run install:all` to install dependencies
2. Backend starts automatically on port 5000
3. `.env` required: `PORT=5000`, `DATABASE_NAME=hackarena.db`

## Tech Stack

- **Frontend**: React 18, Vite, html5-qrcode, React Router
- **Backend**: Express.js, better-sqlite3 (local MySQL), QRCode
- **Database**: SQLite file (local storage - no external DB needed)

## Notes

- No test suite configured
- Uses ES modules (`"type": "module"`)
- Entries: backend `src/index.js`, frontend `src/main.jsx`
- QR codes link to `/scan?team={teamId}`
- Evaluations are immutable (one submission per judge per team per round)