const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  currentSkin: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  gold: {
    type: Number,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  isOnline: {
    type: Boolean,
    required: true,
  },
  isGuest: {
    type: Boolean,
    required: true,
  },
  friends: {
    type: Array,
    required: true,
  },
  friendRequestsIncoming: {
    type: Array,
    required: true,
  },
  friendRequestsOutgoing: {
    type: Array,
    required: true,
  },
  lastLoggedIn: {
    type: Number,
    required: false,
  },
  socketID: {
    type: String,
    required: false,
  },
  currentRoom: {
    type: String,
    required: false,
  },
  nameChanges: {
    required: true,
    type: Number,
  },
  currentAvatar: {
    required: true,
    type: String,
  },
  currentWallpaper: {
    required: true,
    type: String,
  },
  status: {
    required: true,
    type: String,
  },
  inventory: {
    type: Array,
    required: true,
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
