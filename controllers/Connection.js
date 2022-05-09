const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const EventEmitter = require("events");
const User = require("../classes/User");
const UserSchema = require("../models/UserSchema");

const PORT = process.env.PORT || 5000;
const DATABASE_URL = `mongodb+srv://admin:${process.env.MONGO_PW}@cluster0.s1t7x.mongodb.net/test1?retryWrites=true&w=majority`;

class ConnectionEventType {
  static CONNECT = "socket-connect"; // Socket connected
  static DISCONNECT = "socket-disconnect"; // Socket disconnected
  static INVALIDATE = "invalidate-user"; // Invalidate user data (tells front-end to refresh)
}

class GameEventType {
  static INVALIDATE = "invalidate-game"; // Invalidate game data (tells front-end to refresh)
  static JOINED = "game-joined"; // BE -> FE User joined game
  static LEFT = "game-left"; // BE -> FE User left game
  static START = "game-start"; // FE -> BE Host starts the Game
  static SETUP = "game-round-setup"; // BE -> FE Send information for the current game round, e.g. Questions
  static ANSWER = "game-answer"; // FE -> BE User chooses an Answer
  static RESULT = "game-round-result"; // BE -> FE Send Results from the Round to FE. Also start next round or goto END
  static END_GAME = "game-ended"; // BE -> FE Send information about the round, e.g. Ranking for the ended Round.
  static MOVE_CURSOR = "game-move-cursor"; // FE -> BE -> FE Move the cursor
  static GAME_TICK = "game-tick"; // BE -> FE Tick the game
}

class Connection extends EventEmitter {
  static _instance;

  static sockets = {}; // Active socket connections

  constructor() {
    super();
  }

  static invalidateUserBySocketID(socketID) {
    if (!socketID) return;
    Connection.getSocket(socketID)?.emit(ConnectionEventType.INVALIDATE);
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
    this.io = require("socket.io")(this.httpServer, {
      cors: { origin: "*", methods: ["GET", "POST"] }
    });

    this.io.on("connection", (socket) => {
      // A socket connected
      console.log("💻", "Socket connected", socket.id);
      Connection.sockets[socket.id] = socket;

      //Subscribe to general-chat room
      socket.join("general-chat");

      const data = {
        userID: socket.request["_query"].userID,
        online: true
      };

      Connection.invalidateUserBySocketID(socket.id);
      this.emit(ConnectionEventType.CONNECT, socket.id, data);

      this.updateOnlineUsersCount();

      /**
       * GAME EVENTS
       * Game events are always emitted to be listened to in Game.js
       */

      socket.on(GameEventType.JOIN, (data) => {
        this.emit(GameEventType.JOIN, socket.id, data);
      });

      /**
       * CHAT EVENTS
       */

      socket.on("chat", (message) => {
        // Get the user by socketId
        UserSchema.findOne({
          socketID: socket.id
        })
          .catch(() => "Error")
          .then((user) => {
            // Broadcast the message, date, and user (small) to the general-chat room
            const userSm = new User.Small(user);
            // Comment emoji
            console.log("💬", userSm.username, ": ", message);
            this.io.to("general-chat").emit("chat", {
              message: message,
              time: new Date().getTime(),
              user: userSm
            });
          });
      });

      /**
       * MISC
       */

      socket.on("disconnect", () => {
        // A socket disconnected
        console.log("💀", "Socket disconnected:", socket.id);
        this.emit(ConnectionEventType.DISCONNECT, socket.id);

        if (Connection.sockets[socket.id]) delete Connection.sockets[socket.id];
        this.updateOnlineUsersCount();
      });
    });
  }

  updateOnlineUsersCount() {
    const count = Object.keys(Connection.sockets).length;
    console.log("👥", count, "online users");
    this.io.to("general-chat").emit("online-users", count);
  }

  connectToDatabaseAndStartServer() {
    // Connect to MongoDB
    mongoose
      .connect(DATABASE_URL)
      .then(() => {
        console.log("Connected to MongoDB");
        // Start the socket server
        this.httpServer.listen(PORT, () => {
          console.log("Socket server started at", `http://localhost:${PORT}`);
        });
      })
      .catch((err) => console.log("Error connecting to database:", err));
  }

  static get instance() {
    if (!this._instance) this._instance = new Connection();
    return this._instance;
  }
}

module.exports = {
  Connection,
  ConnectionEventType,
  GameEventType
};
