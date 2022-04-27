const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatRoomSchema = new Schema({
  chatID: String,
  users: {
    type: Array,
    required: true,
  },
  prevMessages: {
    type: Array,
    required: false,
  },
});

const ChatRoom = mongoose.model('chatRoomSchema', chatRoomSchema);

module.exports = ChatRoom;

/* 
{
  chatID: String,
  users: [
    id: String,
    id: String
  ],
  prevMessages: [
    {
      from: String,
      timeStamp: Date,
      content: String
    }
  ]
}
*/
