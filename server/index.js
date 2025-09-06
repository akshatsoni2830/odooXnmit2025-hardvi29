require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin only if credentials are set
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  admin.initializeApp();
  console.log('✅ Firebase Admin initialized');
} else {
  console.log('⚠️ GOOGLE_APPLICATION_CREDENTIALS not set — Firebase Admin NOT initialized');
}

// Middleware
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const projectsRouter = require('./routes/projects');

// Routes
app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// Mount API routes
app.use('/api/projects', projectsRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});