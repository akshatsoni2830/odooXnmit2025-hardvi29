# How to Run the Project

## Environment Setup

### Windows PowerShell
Set your Firebase credentials:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\secrets\firebase-oddo2k25.json"
```

## Running the Servers

### Terminal 1 - Backend Server
```bash
cd server
npm install
npm run dev
```

### Terminal 2 - Frontend Server
```bash
cd frontend
npm install
npm run dev
```

The backend will run on `http://localhost:5000`
The frontend will run on `http://localhost:5173`

## Important Notes

- **Never commit** `serviceAccountKey.json` to git
- Use GitHub Secrets for CI/CD deployment
- The frontend proxy automatically forwards `/api/*` requests to the backend
- Backend health check: GET `/health`
- Test endpoint: GET `/api/hello`
