const admin = require('firebase-admin');
const User = require('../models/User');

const verifyFirebase = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    // Extract token from "Bearer <token>" format
    const idToken = authHeader.split(' ')[1];
    
    if (!idToken) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // TODO: Verify the Firebase ID token
    // const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // TODO: Find or create user in database by firebaseUid
    // let user = await User.findOne({ firebaseUid: decodedToken.uid });
    // if (!user) {
    //   user = await User.create({
    //     firebaseUid: decodedToken.uid,
    //     name: decodedToken.name || 'Unknown User',
    //     email: decodedToken.email
    //   });
    // }

    // TODO: Attach user info to request
    // req.auth = decodedToken;
    // req.userLocal = user;
    
    // For now, just pass through - implement verification logic later
    next();
    
  } catch (error) {
    console.error('Firebase verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = verifyFirebase;
