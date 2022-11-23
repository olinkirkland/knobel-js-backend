// Dependencies
const { Connection } = require("../controllers/Connection");

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();
const AvatarSchema = require("../models/AvatarSchema");
const User = require("../models/UserSchema");

// Routes
const usersRouter = require("../routes/users");
const gameRoute = require("../routes/game").router;
const friendsRoute = require("../routes/friends");
const cheatRoute = require("../routes/cheat");
const shop = require("../routes/shop");

// Connection
const connection = Connection.instance;
connection.connect(app);

// Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8000",
      "http://olinkirk.land",
      "https://olinkirk.land",
      "http://olinkirk.land/dont-fall",
      "https://olinkirk.land/dont-fall",
      "http://teleturbis.github.io/bugFixes",
      "https://teleturbis.github.io/bugFixes",
      "http://teleturbis.github.io",
      "https://teleturbis.github.io",
      "http://knobel.ninja",
      "https://knobel.ninja"
    ],
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/users", usersRouter);
app.use("/game", gameRoute);
app.use("/friends", friendsRoute);
app.use("/cheat", cheatRoute);
app.use("/shop", shop);

app.get("/testcors", (req, res) => {
  res.send("Hello world!!!");
});

// Send the Requester Informations about the BackEnd
app.get("/info", cors({ origin: "*" }), (req, res) => {
  res.sendFile(path.join(__dirname, "../ReadMe.html"));
});

// Send the Requester Informations about the ErrorCodes
app.get("/errorcodes", cors({ origin: "*" }), (req, res) => {
  res.sendFile(path.join(__dirname, "../ErrorCodes.html"));
});

// Delete Guests every 15 min, if they are offline
setInterval(() => {
  User.deleteMany({ isGuest: true, isOnline: false });
}, 1000 * 60 * 15);

app.get("/avatars", cors({ origin: "*" }), async (req, res) => {
  const query = await AvatarSchema.find();
  res.send(query);
});

app.get("/impressum/:type", cors({ origin: "*" }), async (req, res) => {
  if (req.params.type !== "json") {
    res.sendFile(path.join(__dirname, "../impressum.html"));
  } else {
    res.sendFile(path.join(__dirname, "../impressum.json"));
  }
});
