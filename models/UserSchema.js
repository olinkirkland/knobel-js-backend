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
  skins: {
    type: Array,
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
});

const User = mongoose.model('User', userSchema);

module.exports = User;
