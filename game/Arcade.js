const { User } = require("../classes/User");
const {
  Connection,
  GameEventType,
  ConnectionEventType
} = require("../controllers/Connection");
const { getUserSchemaBySocketID } = require("../controllers/UserHandler");
const Game = require("./Game");

const games = [];

Connection.instance.on(ConnectionEventType.DISCONNECT, (socketID, data) => {
  // A user disconnected, remove them from any game they are in
  
  const userSchema = getUserSchemaBySocketID(socketID).then((userSchema) => {
    if (!userSchema) return;
    const user = new User(userSchema);
    if (user.gameID) leaveGame(user);
  });
});

function hostGame(user, gameOptions) {
  console.log(`🎮 ${user.username} is creating game '${gameOptions.name}' ...`);

  // Game name must be unique
  if (getGameByName(gameOptions.name)) {
    console.log(`🎮 Game '${gameOptions.name}' already exists`);
    return false;
  }

  // A user cannot host a game if they are already in a game
  if (user.gameID) {
    console.log(`🎮 ${user.username} is already in a game`);
    return false;
  }

  const game = new Game(gameOptions, user);
  games.push(game);

  console.log(`✔️ Game '${gameOptions.name}' was created`);
  return game.gameID;
}

function joinGame(user, gameID) {
  console.log(`🎮 User ${user.username} is joining game ${gameID} ...`);

  // A user cannot join a game if they are already in a game
  if (user.gameID) {
    console.log(`🎮 ${user.username} is already in a game`);
    return false;
  }

  const game = getGameByID(gameID);
  if (!game) return false;

  // Add user to game
  game.addPlayer(user);
  Connection.instance.io.to(gameID).emit(GameEventType.INVALIDATE);
  
  console.log(`🎮 User ${user.username} joined game ${gameID}`);
  return true;
}

function leaveGame(user) {
  console.log(`🎮 ${user.username} is leaving their current game ...`);

  // A user must be in a game to leave
  if (!user.gameID) {
    console.log(`🎮 ${user.username} is not in a game`);
    return false;
  }

  // Broadcast to game room
  const game = getGameByID(user.gameID);
  if (!game) return false;

  game.removePlayer(user);

  console.log(`🎮 User ${user.username} left game ${user.gameID}`);

  if (game.players.length === 0) {
    // Delete the game if there are no players left
    game.dispose();
    games.splice(games.indexOf(game), 1);
    console.log(
      `🗑️ Game ${game.name} was garbage collected because there were no players`
    );
  } else {
    // If the host left, pick a new host
    // todo
  }

  return true;
}

function getGameByID(gameID) {
  return games.find((game) => game.gameID === gameID);
}

function getGameByName(gameName) {
  return games.find((game) => game.name === gameName);
}

module.exports = {
  hostGame,
  joinGame,
  leaveGame,
  getGame: getGameByID,
  games
};
