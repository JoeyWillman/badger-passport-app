const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json'); // Make sure this path is correct

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function checkAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).send("No token provided");
  }

  const idToken = authHeader.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.firebaseUserId = decodedToken.uid; // Attach user ID to the request
    next(); // Proceed to the route handler
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    res.status(401).send("Unauthorized");
  }
}

module.exports = checkAuth;
