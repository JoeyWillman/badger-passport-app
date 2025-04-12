const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  firebaseUid: String,
  name: String,
  email: String,
  friends: [String],        // array of userIds (firebase UIDs or user _ids)
  visitedLocations: [String], // array of location IDs (or ObjectIds)
  badges: [String]          // array of badge IDs or names
});
module.exports = mongoose.model('User', UserSchema);
