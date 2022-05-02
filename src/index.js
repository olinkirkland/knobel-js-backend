// Dependencies
const { Connection } = require('../controllers/Connection');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

// Routes
const usersRouter = require('../routes/users');
const gameRoute = require('../routes/game');
const friendsRoute = require('../routes/friends');
const cheatRoute = require('../routes/cheat');

// Connection
const connection = Connection.instance;
connection.connect(app);

// Middlewares
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:8000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/users', usersRouter);
app.use('/game', gameRoute);
app.use('/friends', friendsRoute);
app.use('/cheat', cheatRoute);

app.get('/testcors', (req, res) => {
  res.send('Hello world!!!');
});

// Send the Requester Informations about the BackEnd
app.get('/info', cors({ origin: '*' }), (req, res) => {
  res.sendFile(path.join(__dirname, '../ReadMe.html'));
});

// Send the Requester Informations about the ErrorCodes
app.get('/errorcodes', cors({ origin: '*' }), (req, res) => {
  res.sendFile(path.join(__dirname, '../ErrorCodes.html'));
});

console.log(new Date().getHours());
