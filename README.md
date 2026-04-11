# HackArena Scanner

A production-ready QR-based hackathon evaluation scanner app with local SQLite database.

## Features

- **QR Code Scanning**: Judges scan team QR codes to evaluate
- **Team Management**: Create teams and generate unique QR codes
- **Judge Management**: Add/remove judges who will evaluate teams
- **5 Criteria Scoring**:
  - Novelty (20 marks)
  - Usage (20 marks)
  - Methodology (20 marks)
  - Presentation (20 marks)
  - Uniqueness (20 marks)
- **Round-based Results**: View leaderboard for each round
- **Local Database**: SQLite stored locally (no external DB required)
- **Immutable Results**: Once submitted, evaluations cannot be edited

## Tech Stack

- **Frontend**: React 18, Vite, html5-qrcode, React Router
- **Backend**: Express.js, better-sqlite3, QRCode generation
- **Database**: SQLite (local file)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
# Install all dependencies
npm run install:all

# Or install separately
cd backend && npm install
cd ../frontend && npm install
```

### Development

```bash
# Open two terminals

# Terminal 1: Start backend (port 5000)
cd backend
npm run dev

# Terminal 2: Start frontend (port 5173)
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

### Production Build

```bash
# Build frontend
npm run build

# Start backend (serves API on port 5000)
npm run start
```

## Workflow

### 1. Setup Judges
- Go to **Judges** page
- Add all judges who will evaluate teams

### 2. Register Teams
- Go to **Teams** page  
- Add teams with: name, leader, details, members
- Each team gets a unique QR code

### 3. Print QR Codes
- On Teams page, click "View QR" for each team
- Print and distribute to teams

### 4. Judge Evaluations
- Judges go to **Scan** page
- Scan team's QR code (or use `/scan/:teamId`)
- Select their name from dropdown
- Give marks (0-20) for each of 5 criteria
- Add optional remarks
- Submit (one submission per team per judge, immutable)

### 5. View Results
- Go to **Results** page
- See ranked leaderboard with all scores

## API Endpoints

### Teams
- `GET /api/teams` - List all teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team details
- `DELETE /api/teams/:id` - Delete team
- `GET /api/teams/:id/qrcode` - Get team QR code

### Judges
- `GET /api/judges` - List all judges
- `POST /api/judges` - Add judge
- `DELETE /api/judges/:id` - Remove judge

### Evaluations
- `GET /api/evaluations` - List all evaluations
- `GET /api/evaluations/round/:roundNumber` - Get round results
- `GET /api/evaluations/team/:teamId` - Get team evaluations
- `POST /api/evaluations` - Submit evaluation

### Health
- `GET /api/health` - Check database connection

## Project Structure

```
scanner/
├── backend/
│   ├── src/
│   │   ├── index.js       # Express server
│   │   ├── database.js   # SQLite setup
│   │   └── routes/       # API routes
│   │       ├── teams.js
│   │       ├── judges.js
│   │       └── evaluations.js
│   ├── .env              # Configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── pages/
│   │   │   ├── ScannerPage.jsx
│   │   │   ├── TeamsPage.jsx
│   │   │   ├── JudgesPage.jsx
│   │   │   └── ResultsPage.jsx
│   │   ├── components/
│   │   └── utils/
│   │       └── api.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── package.json
```

## Deployment

### Local Server (Production)

1. Build frontend:
```bash
npm run build
```

2. Configure backend to serve static files (optional):
- Add Express static middleware
- Or deploy frontend to CDN

3. Start backend:
```bash
npm run start
```

### VPS/Cloud Deployment

1. **Upload files** to your server (via FTP, SCP, etc.)

2. Install Node.js and npm:
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. Install dependencies:
```bash
npm run install:all
```

4. Start backend:
```bash
cd backend && npm run start
```

5. For production, use Process Manager (PM2):
```bash
# Install PM2
npm install -g pm2

# Start backend
pm2 start backend/src/index.js --name hackarena

# Auto-start on reboot
pm2 startup
pm2 save
```

### Using Reverse Proxy (Nginx)

1. Install Nginx

2. Configure:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5173;
    }

    location /api {
        proxy_pass http://localhost:5000;
    }
}
```

3. Enable and restart:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Docker Deployment (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend ./backend
COPY frontend ./frontend
COPY package.json ./

RUN npm run install:all

EXPOSE 5000

CMD ["npm", "run", "start"]
```

Build and run:
```bash
docker build -t hackarena-scanner .
docker run -p 5000:5000 -p 5173:5173 hackarena-scanner
```

## Database

The SQLite database is stored in `backend/hackarena.db`. It contains:

- **teams**: Team information
- **judges**: Registered judges  
- **evaluations**: Submitted scores (immutable)

## License

MIT