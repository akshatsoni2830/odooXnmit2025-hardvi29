const admin = require('firebase-admin');
const User = require('../models/User');

const verifyFirebase = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check for Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    // Extract token from "Bearer <idToken>" format
    const idToken = authHeader.split(' ')[1];
    
    if (!idToken) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    // Check if Firebase Admin is initialized
    if (!admin.apps || admin.apps.length === 0) {
      console.error('Firebase Admin not initialized');
      return res.status(500).json({ error: 'Auth not configured on server' });
    }

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ error: 'Invalid or expired ID token' });
    }

    // Extract uid from decoded token
    const { uid, email, name } = decodedToken;
    
    if (!uid) {
      return res.status(401).json({ error: 'Invalid or expired ID token' });
    }

    // Find or create user in database by firebaseUid
    let user;
    try {
      user = await User.findOne({ firebaseUid: uid });
      
      if (!user) {
        // Create new user from Firebase token data with fallback name
        const userName = name || email || 'Unnamed User';
        user = await User.create({
          firebaseUid: uid,
          name: userName,
          email: email || '',
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error('Database error in auth middleware:', error);
      return res.status(500).json({ error: 'Internal server error in auth middleware' });
    }

    // Attach user info to request
    req.auth = decodedToken;
    req.userLocal = user;
    
    next();
    
  } catch (error) {
    console.error('Unexpected error in auth middleware:', error);
    res.status(500).json({ error: 'Internal server error in auth middleware' });
  }
};

module.exports = verifyFirebase;