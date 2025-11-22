const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();

// --- IMPORTANT ---
// 1. Download your Service Account Key JSON file from:
//    Firebase Console > Project Settings > Service accounts > Generate new private key
// 2. Save it in the same directory as this file as "serviceAccountKey.json"
// 3. !! MAKE SURE to add "serviceAccountKey.json" to your .gitignore file !!
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// --- Middleware ---

// 1. Enable CORS for all routes, allowing your frontend to make requests
app.use(cors()); // In production, you'd restrict this to your frontend's domain

// 2. A custom middleware to verify the Firebase ID Token
async function checkAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'Forbidden: No token provided or invalid format.' });
  }

  // Extract the token from 'Bearer <token>'
  const idToken = authHeader.split(' ')[1];

  try {
    // Verify the token using the Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Add the decoded token to the request object so routes can use it
    req.user = decodedToken; 
    
    next(); // Token is valid, proceed to the next middleware/route
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(403).json({ message: 'Forbidden: Invalid token.' });
  }
}

// --- Routes ---

// A public route that anyone can access
app.get('/public-route', (req, res) => {
  res.json({ message: 'This is a public route. Anyone can see this!' });
});

// A protected route that requires a valid token
// We apply our 'checkAuth' middleware here
app.get('/protected-route', checkAuth, (req, res) => {
  // If we get here, 'checkAuth' has successfully run
  // We can access the user's info from req.user
  res.json({ 
    message: `Success! You are authenticated as ${req.user.email} (UID: ${req.user.uid}).` 
  });
});

// --- Start Server ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Try accessing /public-route');
  console.log('Try accessing /protected-route (will fail without a token)');
});