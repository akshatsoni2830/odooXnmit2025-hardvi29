# SynergySphere Frontend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `frontend/.env.local.example` to `frontend/.env.local`
   - Fill in your Firebase config values and Cloudinary settings

3. Configure Firebase:
   - Get your Firebase config from Firebase Console > Project Settings
   - Add the config values to `.env.local`

4. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Current Status

This is a bootstrap version with Firebase auth and Cloudinary helpers set up. React components and pages will be generated in the next implementation steps.

Available utilities:
- `src/lib/firebase.js` - Firebase auth initialization and token helper
- `src/utils/cloudinary.js` - Cloudinary upload configuration and helpers
