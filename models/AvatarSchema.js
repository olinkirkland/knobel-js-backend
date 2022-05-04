const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AvatarSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const Avatar = mongoose.model('AvatarSchema', AvatarSchema);

module.exports = Avatar;
