# GHL Dashboard Backend

This is the standalone Node.js API backend for the GoHighLevel Voice AI Dashboard, prepared for deployment on your VPS.

## Requirements
- Node.js (v18 or higher recommended for native `fetch` support)
- MongoDB Cluster

## Setup Instructions

1. **Install Dependencies**
   Run the following command inside this directory:
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Update the `MONGODB_URI` in `.env` if needed.

3. **Start the Server**
   ```bash
   npm start
   ```
   The server will start on port `3001` by default.

## Deployment on VPS (e.g. using PM2)
To keep the server running in the background on your VPS:
```bash
npm install -g pm2
pm2 start index.js --name ghl-backend
pm2 save
```

## Integrating with the Frontend
In your React app, make sure to configure the API base URL to point to this backend (e.g., `http://YOUR_VPS_IP:3001`).
