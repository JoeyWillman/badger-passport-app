// authMiddleware.js
const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json');

// Initialize Admin SDK once
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Attach the user UID/email to req.user for downstream handlers
    req.user = { id: decodedToken.uid, email: decodedToken.email };
    next();

  } catch (err) {
    console.error('❌ Firebase auth failed:', err);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
