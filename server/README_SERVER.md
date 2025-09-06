# SynergySphere Server

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `server/.env.example` to `server/.env`
   - Fill in your MongoDB URI and other config values

3. Place Firebase service account key:
   - Download `serviceAccountKey.json` from Firebase Console
   - Place it at `server/serviceAccountKey.json`
   - Update `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env` to point to this file

4. Run the development server:
```bash
npx nodemon index.js
```

5. Seed demo data (optional):
```bash
node seed/seed.js
```

## Current Status

This is a bootstrap version with placeholder routes. All API endpoints return 501 "Not implemented" responses. The server will boot and connect to MongoDB, but business logic will be implemented in subsequent steps.

Available endpoints:
- `GET /health` - Health check (working)
- `GET /api/projects` - List projects (placeholder)
- `POST /api/projects` - Create project (placeholder)
- And other CRUD operations for projects and tasks (all placeholders)
