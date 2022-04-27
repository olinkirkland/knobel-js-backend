const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FriendsSchema = new Schema({
  friendsID: {
    type: String,
    required: true,
  },
  users: {
    type: Object,
    required: true,
  },
  prevMessages: {
    type: Array,
    required: false,
  },
});

const Friends = mongoose.model('FriendsSchema', FriendsSchema);

module.exports = Friends;
