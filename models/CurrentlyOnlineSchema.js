const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const currentlyOnlineSchema = new Schema({
  roomID: {
    type: String,
    required: true,
  },
  players: [
    {
      username: {
        type: String,
        required: true,
      },
      isGuest: {
        type: Boolean,
        required: true,
      },
      userID: {
        type: String,
        required: true,
      },
      socketID: {
        type: String,
        required: true,
      },
    },
  ],
  spectators: [
    {
      username: {
        type: String,
        required: true,
      },
      isGuest: {
        type: Boolean,
        required: true,
      },
      userID: {
        type: String,
        required: true,
      },
      socketID: {
        type: String,
        required: true,
      },
    },
  ],
  inProgress: {
    type: Boolean,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  maxPlayers: {
    type: Number,
    required: false,
  },
});

const CurrentlyOnline = mongoose.model(
  'CurrentlyOnline',
  currentlyOnlineSchema
);

module.exports = CurrentlyOnline;
