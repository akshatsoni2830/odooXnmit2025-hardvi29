const admin = require('firebase-admin');

const verifyFirebase = async (req, res, next) => {
  try {
    // Read Bearer token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No auth token" });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: "No auth token" });
    }

    // Check if admin is initialized
    if (!admin.apps || admin.apps.length === 0) {
      console.error('Firebase Admin not initialized');
      return res.status(500).json({ error: "Server misconfigured" });
    }

    // Verify the Firebase ID token
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken; // Attach user info to request
      next();
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    
  } catch (error) {
    console.error('Auth middleware error stack:', error.stack);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = verifyFirebase;