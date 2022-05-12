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
const { shuffle, isValidQuestion } = require("../utils/Util");

class Mode {
  static GAME = "mode-game";
  static LOBBY = "mode-lobby";
}

class Player {
  user; // Reference to the user
  isPlaying; // True: Player is currently playing, False: Player is spectating
  state; // Current player state
  points;
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

    this.categories = options.categories;
    this.difficulty = options.difficulty;

    this.numberOfRounds = options.numberOfRounds ? options.numberOfRounds : 5; // Number of rounds to play
    this.roundIndex = 0; // Current round index
    this.question;
    this.correctAnswer;
    this.seconds = -1; // Current seconds to start a countdown from, -1 means no countdown

    this.coordinates = {}; // Coordinates of player cursors

    //* Modifie This Variables!
    this.questionDuration = 7; // Questions will be shown for this amount of seconds
    this.resultsDuration = 3; // Round-Results will be shown for this amount of seconds

    // Broadcast the cursor coordinates to all players every tick
    this.tickInterval = setInterval(() => {
      this.broadcast(GameEventType.GAME_TICK, this.coordinates);
    }, 50);

    this.disposed = false;

    this.addConnectionListeners();
  }

  start() {
    if (this.gameMode == Mode.GAME) {
      console.log("Cannot start the game; game is already started");
      return;
    }

    // Start the game
    this.gameMode = Mode.GAME;

    // Start the Game with current options
    this.roundIndex = 0;
    this.spectators = [];
    this.players.forEach((player) => {
      player.points = 0;
      player.rewards = null;
      player.isPlaying = true;
    });

    console.log("🎮", "Game", `'${this.name}'`, "started");

    this.startRound();
  }

  async startRound() {
    if (this.disposed) return;

    console.log(`Starting round ${this.roundIndex}/${this.numberOfRounds}`);

    // Reset player answers
    this.players.forEach((player) => (player.answer = -1));

    await this.assignQuestion();
    this.invalidateGameData();

    this.seconds = this.questionDuration;
    this.timer = setTimeout(
      this.endRound.bind(this),
      1000 * this.questionDuration
    );
  }

  invalidateGameData() {
    Connection.instance.io.to(this.gameID).emit(GameEventType.INVALIDATE);
  }

  endRound() {
    this.seconds = -1;

    // Include the correct answer
    this.question.correctAnswer = this.correctAnswer;

    // Apply points to players
    this.players.forEach((player) => {
      console.log(
        `Player answered ${player.answer}. Correct answer: ${
          this.correctAnswer
        }. Correct? ${player.answer === this.correctAnswer}`
      );

      if (player.answer === this.correctAnswer) player.points += 5;
    });

    // End the round
    console.log("Round Ended!");
    console.log(
      this.players.map((player) => `${player.user.username} - ${player.points}`)
    );

    this.invalidateGameData();

    // this.seconds = this.resultsDuration;
    setTimeout(this.queueNextRound.bind(this), this.resultsDuration * 1000);
  }

  queueNextRound() {
    this.seconds = -1;

    // Increment the round index and check if we need to end the game
    this.roundIndex++;
    if (this.roundIndex >= this.numberOfRounds) {
      this.roundIndex = 0;
      this.endGame();
    } else {
      this.startRound();
    }
  }

  endGame() {
    // End the game
    this.gameMode = Mode.LOBBY;

    // Sort players by points
    this.players.sort((a, b) => a.points - b.points);

    // Reward players
    this.players.forEach((player, index) => {
      player.rewards = this.getRewards(
        player.points,
        this.players.length,
        index
      );

      ResourceHandler.giveGold(player.user.id, player.rewards.gold);
      ResourceHandler.giveExperience(
        player.user.id,
        player.rewards.experience,
        false
      );
    });

    this.invalidateGameData();
  }

  getRewards(points, totalPlayers, rank) {
    if (points == 0)
      return {
        gold: 0,
        experience: 0
      };

    let gold = 10;
    let experience = 20;

    gold += Math.floor(points / 2);
    experience += points * 2;

    if (totalPlayers > 1) {
      if (rank == 1) {
        gold += 40;
        experience += 50;
      }

      if (rank == 2) {
        gold += 20;
        experience += 30;
      }

      if (rank == 3) {
        gold += 10;
        experience += 20;
      }
    }

    return { gold: gold, experience: experience };
  }

  toListItem() {
    // Return a small object with the game's data intended to be displayed in a list of games
    return {
      gameID: this.gameID,
      name: this.name,
      host: this.hostUser.toPlayerData(),
      playerCount: this.players.length
    };
  }

  toGameState() {
    // Return a small object with the game's data representing the full game state
    return {
      ...this.toListItem(),
      maxPlayers: this.maxPlayers,
      players: this.players.map((player) => {
        return {
          isPlaying: player.isPlaying,
          state: player.state,
          user: player.user.toPlayerData(),
          points: player.points,
          rewards: player.rewards,
          answer: player.answer
        };
      }),
      gameMode: this.gameMode,
      roundIndex: this.roundIndex + 1,
      numberOfRounds: this.numberOfRounds,
      question: this.question,
      seconds: this.seconds,
      categories: this.categories
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
      setTimeout(() => {
        Connection.invalidateUserBySocketID(user.socketID);
      }, 1000);
    });

    // Subscribe the player's socket to the gameID room so they are included in game broadcasts
    player.socket?.join(this.gameID);
    this.players.push(player);

    setTimeout(this.invalidateGameData.bind(this), 200);
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

    if (player.socket) player.socket.leave(this.gameID);

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
    // Add the cursor coordinates to the list of coordinates
    // { userID, x, y }
    this.coordinates[data.userID] = { x: data.x, y: data.y };
  }

  dispose() {
    // Dispose of the game
    clearInterval(this.tickInterval);
    this.disposed = true;
  }

  async assignQuestion() {
    const q = await this.createQuestion();
    this.correctAnswer = q.correctAnswer;
    delete q.correctAnswer;
    this.question = q;
  }

  submitAnswer(userID, answer) {
    console.log(userID, answer);
    const player = this.players.find((p) => p.user.id === userID);
    if (!player) return;

    player.answer = answer;

    this.invalidateGameData();
  }

  async createQuestion() {
    const difficultyStr = this.difficulty
      ? `&difficulty=${this.difficulty}`
      : "";

    // const type = options.type ? `&type=${options.type}` : "&type=multiple";

    const categoryStr =
      this.categories && this.categories.length > 0
        ? `&category=${
            this.categories[Math.floor(Math.random() * this.categories.length)]
          }`
        : "";

    const url =
      "https://opentdb.com/api.php?amount=1" + difficultyStr + categoryStr;
    console.log(url);

    // Fetch Questions
    let u;
    do {
      u = (await axios.get(url)).data.results[0];
    } while (!isValidQuestion(u));
    const q = {
      prompt: u.question,
      answers: shuffle(u.incorrect_answers.concat(u.correct_answer))
    };

    q.correctAnswer = q.answers.indexOf(u.correct_answer);

    return q;
  }
}

module.exports = { Game, GameMode: Mode };
