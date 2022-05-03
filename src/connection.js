const http = require('http');

require('dotenv').config();

const mongoose = require('mongoose');

const UserController = require('../controllers/UserController');
const gameHandler = require('../controllers/gameHandler');
const gmaeRoute = require('../routes/game');

const port = process.env.PORT || 5000;
const dbURI = `mongodb+srv://admin:${process.env.MONGO_PW}@cluster0.s1t7x.mongodb.net/test1?retryWrites=true&w=majority`;

function connect(app) {
  const httpServer = http.createServer(app);

  const io = require('socket.io')(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    console.log(socket.id, 'connected');

    const data = {
      userID: socket.request['_query'].userID,
      online: true,
      username: socket.request['_query'].username,
    };

    // Add new User to currentlyonlines-Collection
    UserController.changeOnlineState(data, socket.id);

    socket.on('disconnect', () => {
      // Console.log Disconnect-Message & Update currentlyonlines-Collection
      console.log(socket.id, 'disconnected');
      UserController.changeOnlineState({ online: false }, socket.id);
    });

    socket.on('chat', (data, room) => {
      if (room !== 'undefined' || room !== null || room !== '') {
        socket.to(room).emit(chat);
      } else {
        // Broadcast Message to all Users, except the sending User
        socket.broadcast.emit('chat', data);
      }
    });

    socket.on('game-room', (data, room) => {
      socket.to(room).emit(chat);
    });

    socket.on('join-game-room', (room) => {
      // UserHandler.changeSocketRoom(socket.request['_query'], socket.id);
      console.log(`user joind GameRoom ${room}`);
      socket.join(room);
      // game.joinGame(socket.id, room);
    });

    socket.on('join-room', (room) => {
      // UserHandler.changeSocketRoom(socket.request['_query'], socket.id);
      console.log(`user joind Room ${room}`);
      socket.join(room);
    });
  });

  // Connect to MongoDB, then start Server
  mongoose
    .connect(dbURI)
    .then(() => {
      // Start the Express server if connection to DB was successful
      httpServer.listen(port, () => {
        console.log(`Server started at http://localhost:${port}`);
      });
    })
    .catch((err) => console.log('ERROR:', err));
}

module.exports = connect;
