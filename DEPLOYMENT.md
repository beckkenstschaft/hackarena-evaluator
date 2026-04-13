# Deployment Guide: Vercel Frontend + Local Backend

This guide explains how to deploy the frontend to Vercel while running the backend on your local system.

---

## Architecture Overview

```
┌───────────────────────────────────────────────────────────────┐
│                        VERCEL                                 │
│                    (Frontend: 5173)                           │
│                   https://your-app.vercel.app                 │
└─────────────────────────┬─────────────────────────────────────┘
                         │
                         │ API Calls (reverse proxy)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR LOCAL SYSTEM                             │
│                   (Backend: Port 5000)                         │
│              http://localhost:5000 OR                           │
│              https://your-public-ip:5000                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Prepare Your Local Backend

### 1.1 Update Environment Variables

Edit `backend/.env`:

```env
PORT=5000
DATABASE_NAME=hackarena.db
USE_HTTPS=false
```

> **Important**: Set `USE_HTTPS=false` for local development with Vercel. HTTPS will be handled by Vercel's proxy.

### 1.2 Allow External Access

If you want judges to access from other devices on your network:

1. Find your local IP address:

   ```bash
   # Windows
   ipconfig

   # Mac/Linux
   ipconfig getifaddr en0
   ```
2. Start backend with host binding:

   ```bash
   cd backend
   node src/index.js
   ```

   The backend will now be accessible at `http://YOUR_LOCAL_IP:5000`

### 1.3 (Optional) Open Port in Firewall

If judges are on different networks, open port 5000 in your firewall:

- **Windows**: Go to Windows Defender Firewall > Advanced Settings > Inbound Rules > New Rule
- **Router**: Set up port forwarding (if judges are outside your network)

---

## Step 2: Configure Frontend Proxy

### 2.1 Update Vercel Configuration

Create `frontend/vercel.json` in the frontend directory:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://YOUR_LOCAL_IP:5000/api/:path*"
    }
  ]
}
```

Replace `YOUR_LOCAL_IP` with your computer's local IP address (e.g., `192.168.1.100`).

> **Important**: This file must be in the `frontend/` directory.

### 2.2 For External Access (Different Network)

If judges will access from outside your local network, you need a public URL:

**Option A: Use ngrok (Recommended)**

```bash
# Download ngrok from https://ngrok.com
ngrok http 5000
# This gives you a public URL like https://abc123.ngrok.io

# Then update vercel.json:
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://abc123.ngrok.io/api/:path*"
    }
  ]
}
```

**Option B: Use localtunnel**

```bash
npx localtunnel --port 5000
```

**Option C: Use VPN (Tailscale/Cloudflare WARP)**

---

## Step 3: Deploy to Vercel

### 3.1 Install Vercel CLI

```bash
npm i -g vercel
```

### 3.2 Build the frontend

```bash
cd frontend
npm run build
```

### 3.3 Deploy

```bash
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

---

## Step 4: Configure API Base URL in Code

The frontend uses relative `/api` paths, which will be proxied by Vercel to your local backend.

No code changes needed if using `vercel.json` rewrite rules.

---

## Step 5: Start the Backend

### 5.1 Run Backend on Your Local System

```bash
cd backend
npm run start
```

You should see:

```
HTTP Server running on http://localhost:5000
```

### 5.2 Verify Connection

Test from another terminal:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{"status":"ok","database":"connected","protocol":"http"}
```

---

## Troubleshooting

### Issue: "Cannot connect to backend"

- Verify backend is running: `curl http://localhost:5000/health`
- Check firewall allows port 5000
- Verify `vercel.json` has correct IP address

### Issue: "SSL Certificate Error"

- Ensure `USE_HTTPS=false` in backend/.env
- The connection between Vercel and your local backend is HTTP (not HTTPS)

### Issue: Judges can't access from outside network

- Use ngrok or localtunnel for public URL
- Update `vercel.json` with the public URL
- Open port 5000 in your firewall

### Issue: CORS Errors

- The backend uses CORS middleware
- For production, add your Vercel domain to CORS configuration in `backend/src/index.js`

---

## Quick Reference: Commands

```bash
# Start local backend
cd backend
npm run start

# Start frontend dev server (for testing)
cd frontend
npm run dev

# Build frontend
cd frontend
npm run build

# Deploy to Vercel
vercel --prod
```

---

## Network Diagram for Judges

```
Judge's Phone/Tablet
       │
       │ https://your-app.vercel.app
       ▼
┌──────────────────────────────────────┐
│             VERCEL                    │
│         (API Proxy)                  │
│   /api/* → http://YOUR_IP:5000/api/* │
└──────────────────────────────────────┘
       │
       │ HTTP (local network)
       ▼
┌──────────────────────────────────────┐
│         YOUR COMPUTER                 │
│       Backend (Port 5000)           │
│      + SQLite Database               │
└──────────────────────────────────────┘
```

---

## Summary

| Component | Location     | URL                            |
| --------- | ------------ | ------------------------------ |
| Frontend  | Vercel       | https://your-app.vercel.app    |
| Backend   | Local System | http://localhost:5000          |
| API Proxy | Vercel       | /api/* → localhost:5000/api/* |

The key is the `vercel.json` rewrite rule that proxies API calls from Vercel to your local backend.
