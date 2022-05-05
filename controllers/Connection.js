const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const EventEmitter = require('events');
const User = require('../classes/User');
const UserSchema = require('../models/UserSchema');

const PORT = process.env.PORT || 5000;
const DATABASE_URL = `mongodb+srv://admin:${process.env.MONGO_PW}@cluster0.s1t7x.mongodb.net/test1?retryWrites=true&w=majority`;

class ConnectionEventType {
  static CONNECT = 'socket-connect'; // Socket connected
  static DISCONNECT = 'socket-disconnect'; // Socket disconnected
  static INVALIDATE = 'invalidate-user'; // Invalidate user data (tells front-end to refresh)
}

class GameEventType {
  static JOIN = 'game-join'; // Player joined game
  static START = 'game-start'; // Host starts the Game
  static ANSWER = 'game-answer'; // User clicks on Answer
  static SETUP = 'game-round-setup'; // Send information for the current game round, e.g. Questions & Answers
  static RESULT = 'game-round-result'; // Send Results from the Round to FE. Also start next round or goto END
  static END = 'game-ended'; // Send information about the round, e.g. Ranking for the ended Round.
}

class Connection extends EventEmitter {
  static _instance;

  static sockets = {}; // Active socket connections

  constructor() {
    super();
  }

  static invalidateUserBySocketID(socketID) {
    if (!socketID) return;
    Connection.getSocket(socketID).emit(ConnectionEventType.INVALIDATE);
  }

  static getSocket(id) {
    return Connection.sockets[id];
  }

  connect(app) {
    this.httpServer = http.createServer(app);
    this.startSocketServer();
    this.connectToDatabaseAndStartServer();
  }

  startSocketServer() {
    const io = require('socket.io')(this.httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    io.on('connection', (socket) => {
      // A socket connected
      console.log('💻', 'Socket connected', socket.id);
      Connection.sockets[socket.id] = socket;

      //Subscribe to general-chat room
      socket.join('general-chat');

      const data = {
        userID: socket.request['_query'].userID,
        online: true,
      };

      console.log('🗃️ ', data);

      this.emit(ConnectionEventType.CONNECT, socket.id, data);

      /**
       * GAME EVENTS
       * Game events are always emitted to be listened to in Game.js
       */

      socket.on(GameEventType.JOIN, (data) => {
        this.emit(GameEventType.JOIN, socket.id, data);
      });

      socket.on(GameEventType.START, (data) => {
        this.emit(GameEventType.START, socket.id);
      });

      socket.on(GameEventType.ANSWER, (data) => {
        this.emit(GameEventType.ANSWER, socket.id, data);
      });

      socket.on(GameEventType.SETUP, (data) => {
        this.emit(GameEventType.SETUP, socket.id, data);
      });

      socket.on(GameEventType.RESULT, (data) => {
        this.emit(GameEventType.RESULT, socket.id, data);
      });

      socket.on(GameEventType.END, (data) => {
        this.emit(GameEventType.END, socket.id, data);
      });

      /**
       * CHAT EVENTS
       */

      socket.on('chat', (message) => {
        // Get the user by socketId
        UserSchema.findOne({
          socketID: socket.id,
        })
          .catch(() => 'Error')
          .then((user) => {
            // Broadcast the message, date, and user (small) to the general-chat room
            const userSm = new User.Small(user);
            console.log('📩', userSm.username, message);
            io.to('general-chat').emit('chat', {
              message: message,
              time: new Date().getTime(),
              user: userSm,
            });
          });
      });

      /**
       * MISC
       */

      socket.on('disconnect', () => {
        // A socket disconnected
        console.log('💀', 'Socket disconnected:', socket.id);
        if (Connection.sockets[socket.id]) delete Connection.sockets[socket.id];
        this.emit(ConnectionEventType.DISCONNECT, socket.id);
      });
    });
  }

  connectToDatabaseAndStartServer() {
    // Connect to MongoDB
    mongoose
      .connect(DATABASE_URL)
      .then(() => {
        console.log('Connected to MongoDB');
        // Start the socket server
        this.httpServer.listen(PORT, () => {
          console.log('Socket server started at', `http://localhost:${PORT}`);
        });
      })
      .catch((err) => console.log('Error connecting to database:', err));
  }

  static get instance() {
    if (!this._instance) this._instance = new Connection();
    return this._instance;
  }
}

module.exports = {
  Connection,
  ConnectionEventType,
  GameEventType,
};
