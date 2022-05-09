const express = require("express");
const router = express.Router();

const JWT = require("../controllers/JWT");
const gameHandler = require("../game/GameData");
const UserHandler = require("../controllers/UserHandler");
const Arcade = require("../game/Arcade");

const UserSchema = require("../models/UserSchema");
const { GameMode } = require("../game/Game");

router.get("/list", (req, res) => {
  res.send(Arcade.games.map((game) => game.toListItem()));
});

router.post("/host", JWT.check, async (req, res) => {
  const user = await UserHandler.getUserById(req.body.userID);
  const gameOptions = req.body.gameOptions;

  const gameID = Arcade.hostGame(user, gameOptions);
  if (gameID) res.status(200).send(gameID);
  else res.status(500).send("Error creating game");
});

router.post("/join", JWT.check, async (req, res) => {
  const user = await UserHandler.getUserById(req.body.userID);
  const gameID = req.body.gameID;

  Arcade.joinGame(user, gameID)
    ? res.status(200).send("Game joined")
    : res.status(500).send("Error joining game");
});

router.post("/leave", JWT.check, async (req, res) => {
  const user = await UserHandler.getUserById(req.body.userID);

  Arcade.leaveGame(user)
    ? res.status(200).send("Game left")
    : res.status(500).send("Error leaving game");
});

// TODO add JWT.check,
router.get("/:id", (req, res) => {
  // Return game state, this is called by clients when the game state is invalidated via socket
  const gameID = req.params.id;
  const game = Arcade.getGame(gameID);

  // Does game exist?
  if (!game) return res.status(404).send("Game not found");

  // Is the user in the game?
  console.log(req.body);

  res.status(200).send(game.toGameState());
});

router.get("/categories", JWT.check, (req, res) => {
  // Return available question categories
  res.send(gameHandler.categoriesCatalog());
});

router.post("/start", JWT.check, async (req, res) => {
  // Start a game
  console.log(req.body);
  const user = await UserHandler.getUserById(req.body.userID);
  console.log(user.username, "is starting the game", user.gameID, "...");

  // Is the user in a game?
  if (!user.gameID) return res.status(500).send("User is not in a game");

  // Is the user the host of the game?
  const game = Arcade.getGame(user.gameID);
  if (!game.hostUser.userID === user.userID)
    return res.status(500).send("User is not the host of the game");

  // Is the game already started?
  if (game.mode == GameMode.GAME)
    return res.status(500).send("Game is already started");

  // Start the game
  game.start();
});

router.post("/answer", JWT.check, async (req, res) => {
  const answer =
    typeof req.body.answer === "number"
      ? req.body.answer
      : parseInt(req.body.answer);
  const userID = req.body.userID;

  const user = await UserSchema.findOne({ id: userID }).catch((err) =>
    console.error("Error at Answer:", err)
  );

  Arcade.games
    .find((game) => game.gameID === user.currentRoom)
    .players.find((player) => player.user.id === user.id)
    .answers.push(answer);

  res.status(201).send("Done");
});

module.exports = { router };
