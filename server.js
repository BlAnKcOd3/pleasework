const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
const http = require('http');
const WebSocket = require('ws');

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

// Save a new listing (protected)
app.post('/listings', checkAuth, express.json({limit: '2mb'}), async (req, res) => {
  const { title, description, price, category, image } = req.body;
  if (!title || !description || !price || !category) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  try {
    const docRef = await admin.firestore().collection('listings').add({
      title,
      description,
      price,
      category,
      image,
      userId: req.user.uid,
      userEmail: req.user.email,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ message: 'Listing saved!', id: docRef.id });
  } catch (error) {
    console.error('Error saving listing:', error);
    res.status(500).json({ message: 'Error saving listing.' });
  }
});

// Get all listings (public)
app.get('/listings', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('listings').orderBy('createdAt', 'desc').get();
    const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ listings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Error fetching listings.' });
  }
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
// Create HTTP server so we can attach WebSocket server to the same port
const server = http.createServer(app);

// In-memory message store for local testing (not persistent)
const messagesByChat = {}; // { chatId: [ { text, senderId, senderEmail, timestamp } ] }

// WebSocket server for local real-time messaging between devices
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  ws.subscribedChats = new Set();

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.type === 'join' && data.chatId) {
        ws.subscribedChats.add(data.chatId);
        // Send recent messages for that chat
        const recent = messagesByChat[data.chatId] || [];
        ws.send(JSON.stringify({ type: 'history', chatId: data.chatId, messages: recent }));
      }

      if (data.type === 'message' && data.chatId && data.message) {
        // Store in memory
        messagesByChat[data.chatId] = messagesByChat[data.chatId] || [];
        messagesByChat[data.chatId].push(data.message);

        // Broadcast to all clients subscribed to this chat
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN && client.subscribedChats && client.subscribedChats.has(data.chatId)) {
            client.send(JSON.stringify({ type: 'message', chatId: data.chatId, message: data.message }));
          }
        });
      }
    } catch (e) {
      console.error('WS message parse error', e);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server (HTTP + WS) is running on http://localhost:${PORT}`);
  console.log('Try accessing /public-route');
  console.log('WebSocket server ready for local chat fallback');
});

// Public listing endpoint for demo (no auth required)
app.post('/public-listings', express.json({limit: '6mb'}), async (req, res) => {
  const { title, description, price, category, image } = req.body;
  if (!title || !description || typeof price === 'undefined' || !category) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  try {
    const docRef = await admin.firestore().collection('listings').add({
      title,
      description,
      price,
      category,
      image,
      userId: null,
      userEmail: 'public',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('Public listing saved:', docRef.id);
    res.json({ message: 'Listing saved (public)!', id: docRef.id });
  } catch (error) {
    console.error('Error saving public listing:', error);
    res.status(500).json({ message: 'Error saving listing.' });
  }
});