const { v4: uuidv4 } = require("uuid");
const { Connection, GameEventType } = require("../controllers/Connection");
const UserHandler = require("../controllers/UserHandler");
const User = require("../classes/User");
const UserSchema = require("../models/UserSchema");
const axios = require("axios");

class Game {
  constructor(options) {
    this.name = options.name;
    this.roomID = uuidv4();
    this.hostID = options.hostID;
    this.password = options.password ? options.password : null;
    this.maxPlayer = options.maxPlayer;
    this.players = options.players ? options.players : [];
    this.spectators = options.spectators ? options.spectators : [];
    this.gameMode = options.gameMode;
    this.gameCategory = options.category;
    this.gameDifficulty = options.difficulty;
    this.gameRounds = options.rounds ? options.rounds : 10;
    this.currentRound = 0;
    this.correctAnswer = -2;
    this.question;

    this.timer;
    this.timeoutResults = 5; // Round-Results will be shown for this amount of seconds
    this.timeoutQuestion = 5; // Questions will be shown for this amount of seconds

    this.addConnectionListeners();

    console.log("✔️", "Game", `'${this.name}'`, "was created successfully");
  }

  addConnectionListeners() {
    const connection = Connection.instance;
    connection.on(GameEventType.JOIN, this.onGameJoin.bind(this));
    connection.on(GameEventType.START, this.onGameStart.bind(this));
    connection.on(GameEventType.ANSWER, this.onGameAnswer.bind(this));
    connection.on(GameEventType.SETUP, this.onGameRoundSetup.bind(this));
    connection.on(GameEventType.RESULT, this.onGameResult.bind(this));
    connection.on(GameEventType.END, this.onGameEnd.bind(this));
  }

  async onGameJoin(socketID, data) {
    const user = new User.Full(await UserHandler.getUserBySocketID(socketID));

    const player = {
      userID: user.id,
      socketID: socketID,
      username: user.username,
      level: user.level,
      experience: user.experience,
      gamePoints: [],
      answers: []
    };

    console.log("🎮", user.username, "joined game", `'${this.roomID}'`);
    this.players.push(player);

    // Update User-currentRoom in DB //? Neccessary?
    UserSchema.updateOne({ socketID: socketID }, { currentRoom: this.roomID });

    // Tell the user they joined the game
    const socket = Connection.sockets[socketID];

    socket.join(this.roomID);

    Connection.instance.io
      .to(this.roomID)
      .emit(GameEventType.JOINED, { userID: user.id });
  }

  async onGameStart(socketID) {
    const user = new User.Full(await UserHandler.getUserBySocketID(socketID));

    // Only the host can start the game
    if (user.id !== this.hostID) {
      return;
    }

    console.log("🎮", "Game", `'${this.name}'`, "started");

    this.onGameRoundSetup();

    // Connection.instance.io.to(this.roomID).emit("game-start-in");
  }

  async onGameRoundSetup() {
    const question = await this.getQuestions();
    if (question !== "end") {
      question.lastRound = this.currentRound === this.gameRounds ? true : false;

      // Connection.instance.io.to(this.roomID).emit("game-round-setup", question);
      this.players.forEach((player) => {
        player.answered = false;
        Connection.sockets[player.socketID].emit("game-round-setup", question);
      });

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
      player.answers &&
      player.answers[this.currentRound - 1] === this.correctAnswer
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

    this.players.forEach((player) => {
      Connection.sockets[player.socketID].emit("game-round-result", {
        correctAnswer: this.question.correct_answer,
        roundRanking: roundRanking
      });
    });

    setTimeout(() => this.onGameRoundSetup(), 1000 * this.timeoutResults);

    // Connection.instance.io.to(this.roomID).emit("game-round-result", {
    //   correctAnswer: this.question.correct_answer,
    //   roundRanking: roundRanking
    // });
  }

  async onGameEnd() {
    this.players[1].gamePoints = [0, 0, 0, 0, 0, 50, 0, 0, 0, 50];

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
      this.addExperience(gameRanking.userID, i > 3 ? 10 : 50 - i * 10);
      this.addGold(gameRanking.userID, i > 3 ? 10 : 50 - i * 10);
      this.checkLevel(gameRanking[i].userID);
    }

    // Connection.instance.io.to(this.roomID).emit("game-ended", gameRanking);
    this.players.forEach((player) => {
      Connection.sockets[player.socketID].emit("game-ended", gameRanking);
    });
  }

  async getQuestions() {
    const difficulty = this.difficulty ? `&difficulty=${this.difficulty}` : "";
    const type = this.gameMode ? `&type=${this.gameMode}` : "&type=multiple";
    const category = this.category
      ? `&category=${this.getCategoryID(this.category)}`
      : "";

    if (this.currentRound < this.gameRounds) {
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

      this.correctAnswer = Math.floor(
        Math.random() * (question.answers.length - 1)
      );

      question.answers.splice(
        this.correctAnswer,
        0,
        questionFetch.correct_answer
      );

      console.log("CORRECT", this.correctAnswer);

      this.currentRound++;
      return question;
    } else {
      return "end";
    }
  }

  async checkLevel(userID) {
    let user = await UserHandler.getFullUserById(userID);
    let requiredXP = 100 + ((user.level / 7) ^ 2);
    let lvlUp = true;

    if (user.experience >= requiredXP) {
      do {
        user.level++;
        user.experience = user.experience - requiredXP;
        requiredXP = (100 + user.level / 7) ^ 2;
        lvlUp = user.experience >= requiredXP ? true : false;
      } while (lvlUp);

      UserSchema.findByIdAndUpdate(
        { _id: userID },
        { level: user.level, experience: user.experience }
      ).catch((err) => console.log(err));

      return 228;
    } else {
      return 227;
    }
  }

  async addExperience(userID, experience) {
    let error = null;

    await UserSchema.findByIdAndUpdate(
      { _id: userID },
      { experience: experience }
    ).catch((err) => {
      console.log("AddXP-Error: ", err);
      error = 512;
    });

    return error !== null ? error : checkLevel(userID);
  }

  async addGold(userID, gold) {
    let error = null;

    await UserSchema.findByIdAndUpdate({ _id: userID }, { gold: gold }).catch(
      (err) => {
        console.log("AddGold-Error: ", err);
        error = 512;
      }
    );

    return error !== null ? error : 201;
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

function compareGameResult(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

module.exports = Game;
