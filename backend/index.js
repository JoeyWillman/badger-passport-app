const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Models
const Location = require('./models/Location');
const User = require('./models/User');
const CheckIn = require('./models/CheckIn');

// Middleware
const checkAuth = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(express.json()); // parse JSON request bodies
const upload = multer({ dest: 'uploads/' });

// MongoDB connection
mongoose.connect(
  'mongodb+srv://joeywillman:Joey12345@badger-passport-app.1aabmxv.mongodb.net/badgerpassport?retryWrites=true&w=majority&appName=Badger-Passport-App',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ Mongo connection error:", err));

/* 
  ROUTES 
*/

// 🔐 Protected: Get all locations
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await Location.find({});
    res.json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching locations");
  }
});

// 🔐 Protected: Create user profile
app.post('/api/users', checkAuth, async (req, res) => {
  const firebaseUserId = req.firebaseUserId;
  const { name } = req.body;

  try {
    const newUser = await User.create({
      firebaseUid: firebaseUserId,
      name,
      friends: [],
      visitedLocations: [],
    });
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});

// 🔐 Protected: Submit a check-in
app.post('/api/checkin', checkAuth, upload.single('photo'), async (req, res) => {
  const firebaseUserId = req.firebaseUserId;
  const { locationId, caption } = req.body;
  let photoPath = null;

  try {
    if (req.file) {
      photoPath = req.file.path;
    }

    const checkin = await CheckIn.create({
      userId: firebaseUserId,
      locationId,
      caption,
      photoUrl: photoPath,
      timestamp: new Date(),
    });

    await User.updateOne(
      { firebaseUid: firebaseUserId },
      { $addToSet: { visitedLocations: locationId } }
    );

    res.status(201).json(checkin);
  } catch (err) {
    console.error(err);
    res.status(500).send("Check-in failed");
  }
});

// 🔐 Protected: Get friend feed
app.get('/api/feed', checkAuth, async (req, res) => {
  const firebaseUserId = req.firebaseUserId;

  try {
    const user = await User.findOne({ firebaseUid: firebaseUserId });
    if (!user) return res.status(404).send("User not found");

    const friendsList = user.friends || [];
    const feedCheckins = await CheckIn.find({ userId: { $in: friendsList } })
      .sort({ timestamp: -1 })
      .limit(20);

    res.json(feedCheckins);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch feed");
  }
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
