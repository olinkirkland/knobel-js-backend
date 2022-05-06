const {
  Connection,
  GameEventType,
  ConnectionEventType
} = require("../controllers/Connection");
const { getUserBySocketID } = require("../controllers/UserHandler");
const Game = require("./Game");

const games = [];

Connection.instance.on(ConnectionEventType.DISCONNECT, (socketID, data) => {
  // A user disconnected, remove them from any game they are in
  const user = getUserBySocketID(socketID);
  if (user.gameID) {
    const game = games.find((game) => game.id === user.gameID);
    if (game) {
      game.removeUser(user);
    }
  }
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
  const socket = Connection.getSocket(user.socketID);
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
