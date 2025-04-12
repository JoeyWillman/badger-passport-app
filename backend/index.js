const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


mongoose.connect(
  'mongodb+srv://joeywillman:Joey12345@badger-passport-app.1aabmxv.mongodb.net/badgerpassport?retryWrites=true&w=majority&appName=Badger-Passport-App',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ Mongo connection error:", err));

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json()); // parse JSON bodies

const cors = require('cors');
app.use(cors());

app.get('/api/locations', async (req, res) => {
    try {
      const locations = await Location.find({});
      res.json(locations);
    } catch (err) {
      res.status(500).send("Error fetching locations");
    }
  });
  
  app.post('/api/users', async (req, res) => {
    // Expect req.body to have name, etc. and an Authorization header with Firebase token
    const firebaseUserId = req.firebaseUserId; // (we will set this in auth middleware)
    const { name } = req.body;
    try {
      // create user profile in DB
      const newUser = await User.create({ firebaseUid: firebaseUserId, name, friends: [], visitedLocations: [] });
      res.status(201).json(newUser);
    } catch(err) {
      res.status(500).send("Error creating user");
    }
  });
  
  app.post('/api/checkin', upload.single('photo'), async (req, res) => {
    try {
      const firebaseUserId = req.firebaseUserId;
      const { locationId, caption } = req.body;
      let photoPath = null;
      if (req.file) {
        // Multer saved the file
        photoPath = req.file.path;  // e.g., "uploads/abcdef123456"
      }
      // Create a new check-in document
      const checkin = await CheckIn.create({
        userId: firebaseUserId,
        locationId,
        caption,
        photoUrl: photoPath,
        timestamp: new Date()
      });
      // Update user's visitedLocations and possibly award badge
      await User.updateOne(
        { firebaseUid: firebaseUserId },
        { $addToSet: { visitedLocations: locationId } }
      );
      // (Optional: check if this completes a badge, and update badges)
      res.status(201).json(checkin);
    } catch(err) {
      console.error(err);
      res.status(500).send("Check-in failed");
    }
  });
  
  const formData = new FormData();
formData.append('photo', selectedFile);  // selectedFile from file input
formData.append('locationId', someLocationId);
formData.append('caption', captionText);
const token = await auth.currentUser.getIdToken();
fetch('/api/checkin', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

app.get('/api/feed', async (req, res) => {
    const firebaseUserId = req.firebaseUserId;
    try {
      const user = await User.findOne({ firebaseUid: firebaseUserId });
      if (!user) return res.status(404).send("User not found");
      // Find checkins where userId is in this user's friends list
      const friendsList = user.friends || [];
      const feedCheckins = await CheckIn.find({ userId: { $in: friendsList } })
                                        .sort({ timestamp: -1 })
                                        .limit(20);
      res.json(feedCheckins);
    } catch(err) {
      res.status(500).send("Failed to fetch feed");
    }
  });
  
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
