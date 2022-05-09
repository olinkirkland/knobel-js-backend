const { v4: uuidv4 } = require("uuid");
const {
  Connection,
  GameEventType,
  ConnectionEventType
} = require("../controllers/Connection");
const UserHandler = require("../controllers/UserHandler");
const User = require("../classes/User");
const UserSchema = require("../models/UserSchema");
const axios = require("axios");
const ResourceHandler = require("../controllers/ResourceHandler");

class Mode {
  static GAME = "mode-game";
  static LOBBY = "mode-lobby";
}

class Player {
  user; // Reference to the user
  isPlaying; // True: Player is currently playing, False: Player is spectating
  state; // Current player state
}

class PlayerState {
  coord = { x: 0, y: 0 };
}

class Game {
  constructor(options, hostUser) {
    this.name = options.name; // Unique name of this game instance
    this.gameID = uuidv4(); // Unique ID of this game instance

    this.hostUser = hostUser; // Reference to the host user

    this.password = options.password; // Password is string or null
    this.maxPlayers = options.maxPlayers; // Maximum number of players allowed

    this.players = []; // Array of current players
    this.gameMode = Mode.LOBBY; // Current mode of the game

    this.category = options.category;
    this.difficulty = options.difficulty;

    this.numberOfRounds = options.numberOfRounds ? options.numberOfRounds : 10; // Number of rounds to play
    this.roundIndex = 0; // Current round index
    this.question;

    this.questionDuration = 3; // Questions will be shown for this amount of seconds
    this.resultsDuration = 3; // Round-Results will be shown for this amount of seconds

    setInterval(() => this.onGameTick.bind(this), 100);

    this.addConnectionListeners();
  }

  start() {
    // Start the game
    this.gameMode = Mode.GAME;

    // Start the Game with current options
    this.roundIndex = 0;
    this.spectators = [];
    this.players.forEach((player) => {
      player.points = 0;
      player.isPlaying = true;
    });

    console.log("🎮", "Game", `'${this.name}'`, "started");

    this.setupNextRound();
  }

  setupNextRound() {
    // Setup for the next game round
    this.roundIndex++;
    if (this.roundIndex > this.numberOfRounds) {
      this.endGame();
      return;
    }

    // Reset player answers
    this.players.forEach((player) => {
      player.answer = -1;
    });

    // const question = this.getQuestions();
    // question.lastRound = this.roundIndex === this.numberOfRounds ? true : false;

    this.invalidateGameData();

    this.timer = setTimeout(
      this.endRound.bind(this),
      1000 * this.questionDuration
    );
  }

  invalidateGameData() {
    Connection.instance.io.to(this.gameID).emit(GameEventType.INVALIDATE);
  }

  endRound() {
    // Award players with their points
    this.players.forEach((player) => {
      if (player.answer === answer) player.points += 5;
    });

    // End the round
    console.log("Round Ended!");
    this.broadcast(GameEventType.ROUND_END);
  }

  endGame() {
    // End the game
    this.gameMode = Mode.LOBBY;

    this.broadcast(GameEventType.END_GAME);
  }

  toListItem() {
    // Return a small object with the game's data intended to be displayed in a list of games
    return {
      gameID: this.gameID,
      name: this.name,
      host: this.hostUser.toPlayerData(),
      playerCount: this.players.length,
      maxPlayers: this.maxPlayers,
      inProgress: this.gameMode === Mode.GAME
    };
  }

  toGameState() {
    // Return a small object with the game's data representing the full game state
    return {
      ...this.toListItem()
    };
  }

  addPlayer(user) {
    const player = {
      user: user,
      isPlaying: false,
      socket: Connection.getSocket(user.socketID),
      answer: -1,
      points: 0
    };

    user.gameID = this.gameID;

    UserHandler.getUserSchemaById(user.id).then((userSchema) => {
      userSchema.currentRoom = this.gameID;
      userSchema.save();

      // TODO: Send the following when userSchema.save() is successful
      // for now, wait one second
      setTimeout(
        () => Connection.invalidateUserBySocketID(user.socketID),
        1000
      );
    });

    // Subscribe the player's socket to the gameID room so they are included in game broadcasts
    player.socket.join(this.gameID);
    setTimeout(this.invalidateGameData.bind(this));

    this.players.push(player);
  }

  removePlayer(user) {
    const player = this.players.find((p) => p.user.id === user.id);

    if (!player) return;

    user.gameID = "";
    UserHandler.getUserSchemaById(user.id).then((userSchema) => {
      userSchema.currentRoom = "";
      userSchema.save();

      // TODO: Send the following when userSchema.save() is successful
      // for now, wait one second
      setTimeout(
        () => Connection.invalidateUserBySocketID(user.socketID),
        1000
      );
    });

    player.socket.leave(this.gameID);

    // Remove the player
    this.players = this.players.filter((p) => p.user.id !== user.id);
  }

  broadcast(event, data) {
    // Broadcasts an event/data to members of this game's room
    Connection.instance.io.to(this.gameID).emit(event, data);
  }

  addConnectionListeners() {
    const connection = Connection.instance;
    connection.on(GameEventType.MOVE_CURSOR, this.onMoveCursor.bind(this));
  }

  onMoveCursor(data) {
    // Move the cursor
  }

  onGameTick() {
    this.broadcast(GameEventType.GAME_TICK, {});
  }

  dispose() {
    // Dispose of the game
    // todo
  }

  async onGameAnswer(socketID, data) {
    const user = new User.Small(await UserHandler.getUserBySocketID(socketID));

    console.log("🎮", "User", user.username, "answered");

    if (!this.players.find((el) => el.socketID === socketID).answered) {
      this.players
        .find((el) => el.socketID === socketID)
        .answers.push(parseInt(data));
      this.players.find((el) => el.socketID === socketID).answered = true;
    }
  }

  async onGameResult() {
    const roundRanking = [];

    this.players.forEach((player) => {
      player.answered ? null : player.answers.push(6);
      player.answers && player.answers[this.roundIndex - 1] === this.answerIndex
        ? roundRanking.push({
            userID: player.userID,
            correctAnswer: true,
            points: ""
          })
        : roundRanking.push({
            userID: player.userID,
            correctAnswer: false,
            points: 0
          });
    });

    for (let i = 0; i < roundRanking.length; i++) {
      roundRanking[i].correctAnswer
        ? (roundRanking[i].points = i > 3 ? 10 : 50 - i * 10)
        : 0;
    }

    // Add Points to each Player
    roundRanking.forEach((el) =>
      this.players
        .find((player) => player.userID === el.userID)
        ?.gamePoints.push(el.points)
    );

    roundRanking.sort(compareRoundResult);

    Connection.instance.io.to(this.roomID).emit(GameEventType.RESULT, {
      correctAnswer: this.question.correct_answer,
      roundRanking: roundRanking
    });

    setTimeout(() => this.onGameRoundSetup(), 1000 * this.resultsDuration);
  }

  async onGameEnd() {
    this.players.forEach((player) => {
      player.gamePoints = player.gamePoints.reduce((pv, cv) => pv + cv, 0);
    });

    const gameRanking = this.players.map((player) => {
      return { userID: player.userID, points: player.gamePoints };
    });

    // gameRanking.sort(compareGameResult);
    gameRanking.sort((a, b) =>
      a.points < b.points ? 1 : b.points < a.points ? -1 : 0
    );

    for (let i = 0; i < gameRanking; i++) {
      ResourceHandler.giveExperience(
        gameRanking[i].userID,
        i > 3 ? 10 : 50 - i * 10
      );
      ResourceHandler.giveGold(gameRanking[i].userID, i > 3 ? 10 : 50 - i * 10);
    }

    Connection.instance.io.to(this.roomID).emit(GameEventType.END, gameRanking);
  }

  async getQuestions() {
    const difficulty = this.difficulty ? `&difficulty=${this.difficulty}` : "";
    const type = this.gameMode ? `&type=${this.gameMode}` : "&type=multiple";
    const category = this.category
      ? `&category=${this.getCategoryID(this.category)}`
      : "";

    if (this.roundIndex < this.numberOfRounds) {
      // Build URL from Options

      const url = `https://opentdb.com/api.php?amount=1${
        difficulty + type + category
      }`;

      // Fetch Questions
      const questionFetch = (await axios.get(url)).data.results[0];

      const question = {
        category: questionFetch.category,
        difficulty: questionFetch.difficulty,
        question: questionFetch.question,
        answers: []
      };

      this.question = questionFetch;

      question.answers = questionFetch.incorrect_answers;

      this.answerIndex = Math.floor(
        Math.random() * (question.answers.length - 1)
      );

      question.answers.splice(
        this.answerIndex,
        0,
        questionFetch.correct_answer
      );

      console.log("CORRECT", this.answerIndex);

      this.roundIndex++;
      return question;
    } else {
      return "end";
    }
  }
}

function compareRoundResult(a, b) {
  if (a.points < b.points) {
    return -1;
  }
  if (a.points > b.points) {
    return 1;
  }
  return 0;
}

module.exports = { Game, GameMode: Mode };
