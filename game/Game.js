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
  state;
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
    this.answerIndex;
    this.question;

    this.timer;
    this.timeoutResults = 0.5; // Round-Results will be shown for this amount of seconds
    this.timeoutQuestion = 0.5; // Questions will be shown for this amount of seconds

    // this.addConnectionListeners();

    // Test
    setInterval(() => {
      this.broadcast(GameEventType.INVALIDATE);
    }, 5000);
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
      ...leaflet
    };
  }

  addPlayer(user) {
    const player = {
      user: user,
      isPlaying: false,
      socket: Connection.getSocket(user.socketID)
    };

    user.gameID = this.gameID;

    UserHandler.getUserSchemaById(user.id).then((userSchema) => {
      userSchema.currentRoom = this.gameID;
      userSchema.save();
    });

    player.socket.join(this.gameID);

    this.players.push(player);
  }

  removePlayer(userID) {
    const player = this.players.find((player) => player.user.userID === userID);
    if (!player) return;

    player.user.gameID = "";
    UserHandler.getUserSchemaById(user.id).then((userSchema) => {
      userSchema.currentRoom = "";
      userSchema.save();
    });

    player.socket.leave(this.gameID);

    // Remove the player
    this.players = this.players.filter((el) => el.userID !== userID);
  }

  broadcast(event, data) {
    Connection.instance.io.to(this.gameID).emit(event, data);
  }

  addConnectionListeners() {
    const connection = Connection.instance;
    connection.on(GameEventType.JOIN, this.onGameJoin.bind(this));
    connection.on(GameEventType.LEAVE, this.onGameLeave.bind(this));
    connection.on(GameEventType.START, this.onGameStart.bind(this));
    connection.on(GameEventType.ANSWER, this.onGameAnswer.bind(this));
    connection.on(GameEventType.SETUP, this.onGameRoundSetup.bind(this));
    connection.on(GameEventType.RESULT, this.onGameResult.bind(this));
    connection.on(GameEventType.END, this.onGameEnd.bind(this));
  }

  async onGameJoin(socketID, gameID) {
    if (gameID !== this.gameID) return;

    const user = new User.Full(await UserHandler.getUserBySocketID(socketID));

    const player = {
      userID: user.id,
      socketID: socketID,
      username: user.username,
      level: user.level,
      experience: user.experience,
      gamePoints: [],
      answers: [],
      isPlaying: false // Upon joining, a player is not playing until the next time game-start is called
    };

    console.log("🎮", user.username, "joined game", `'${this.roomID}'`);
    this.players.push(player);

    // Update User-currentRoom in DB //? Neccessary?
    UserSchema.updateOne({ socketID: socketID }, { currentRoom: this.roomID });

    // Tell the user they joined the game
    const socket = Connection.getSocket(socketID);

    socket.join(this.roomID);

    Connection.instance.io.to(this.roomID).emit(GameEventType.JOINED, {
      userID: user.id, // User that joined
      gameID: this.roomID,
      playerIDs: this.players.map((el) => el.userID)
    });
  }

  async onGameLeave(socketID) {
    const user = new User.Full(await UserHandler.getUserBySocketID(socketID));

    console.log("🎮", user.username, "left game", `'${this.roomID}'`);

    // Remove player with userID == user.id from players
    this.players = this.players.filter((el) => el.userID !== user.id);

    const socket = Connection.getSocket(socketID);
    Connection.instance.io.to(this.roomID).emit(GameEventType.LEFT, {
      userID: user.id, // User that left
      playerIDs: this.players.map((el) => el.userID)
    });

    if (socket) socket.leave(this.roomID);

    // Update DB
    UserSchema.updateOne({ socketID: socketID }, { currentRoom: "-1" });
  }

  async onGameStart(socketID) {
    const user = new User.Full(await UserHandler.getUserBySocketID(socketID));

    // Only the host can start the game
    if (user.id !== this.hostID) {
      return;
    }

    // Restart the Game with current Settings
    if (this.roundIndex === this.numberOfRounds) {
      this.roundIndex = 0;
      this.players.push(this.spectators);
      this.spectators = [];
      this.players.forEach((player) => {
        player.gamePoints = [];
        player.answers = [];
      });
    }

    console.log("🎮", "Game", `'${this.name}'`, "started");

    this.onGameRoundSetup();
  }

  async onGameRoundSetup() {
    const question = await this.getQuestions();
    if (question !== "end") {
      question.lastRound =
        this.roundIndex === this.numberOfRounds ? true : false;

      Connection.instance.io
        .to(this.roomID)
        .emit(GameEventType.SETUP, question);

      this.timer = setTimeout(
        () => this.onGameResult(),
        1000 * this.timeoutQuestion
      );
    } else {
      this.onGameEnd();
    }
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

    setTimeout(() => this.onGameRoundSetup(), 1000 * this.timeoutResults);
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

  getCategoryID(category) {
    // Get ID for Category

    switch (category) {
      case "General Knowledge":
        return "9";

      case "Books":
        return "10";

      case "Film":
        return "11";

      case "Music":
        return "12";

      case "Musicals & Theatres":
        return "13";

      case "TV":
        return "14";

      case "Video Games":
        return "15";

      case "Board Games":
        return "16";

      case "Science & Nature":
        return "17";

      case "Computers":
        return "18";

      case "Mathematics":
        return "19";

      case "Mythology":
        return "20";

      case "Sports":
        return "21";

      case "Geography":
        return "22";

      case "History":
        return "23";

      case "Politics":
        return "24";

      case "Art":
        return "25";

      case "Celebrities":
        return "26";

      case "Animals":
        return "27";

      case "Vehicles":
        return "28";

      case "Comics":
        return "29";

      case "Gadgets":
        return "30";

      case "Anime & Manga":
        return "31";

      case "Cartoon & Animations":
        return "32";

      default:
        return "9";
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

module.exports = Game;
