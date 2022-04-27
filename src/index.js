const express = require('express');
const cors = require('cors');

const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

const connection = require('./connection');

// Config
connection(app);

// Routes
const usersRouter = require('../routes/users');
const gameRoute = require('../routes/game');

// Middlewares
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/users', usersRouter);
app.use('/game', gameRoute);

// Testroute
app.get('/test', (req, res) => {
  res.send('Hello world!!!');
});

// Send the Requester Informations about the BackEnd
app.get('/info', (req, res) => {
  res.sendFile(path.join(__dirname, '../ReadMe.html'));
});
