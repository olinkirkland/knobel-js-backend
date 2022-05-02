const { v4: uuidv4 } = require('uuid');
const { count } = require('../models/UserSchema');

class Game {
  constuctor(data) {
    this.name = data.name;
    this.roomID = uuidv4();
    this.host = data.hostID;
    this.password = data.password ? data.password : null;
    this.maxPlayer = data.maxPlayer;
    this.players = data.players;
    this.spectators = data.spectators;
    this.gameMode = data.gameMode;
    this.gameCategory = data.category;
    this.gameDifficulty = data.difficulty;
    this.gameRounds = data.rounds;
    this.gameQuestions = this.getQuestions(data);
  }

  startCountdown() {
    let counter = 3;
    const interval = setInterval(() => {
      if (counter !== 'START') counter--;
      if (counter === 0) {
        counter = 'START';
        return counter;
      }
      if (counter === 'START') {
        clearInterval(interval);
        return;
      }
      if (counter) return counter;
    }, 1000);
  }

  async getQuestions(data) {
    const difficulty = data.difficulty ? `&difficulty=${data.difficulty}` : '';
    const type = data.type ? `&type=${data.type}` : '&type=multiple';
    const amount = data.amount ? `&amount=${data.amount}` : 'amount=10';
    const category = data.category
      ? `&category=${this.getCategoryID(data.category)}`
      : '';

    // Build URL from Options

    const url = `https://opentdb.com/api.php?${
      amount + type + difficulty + category
    }`;

    // Fetch Questions

    return (await axios.get(url)).data.results;
  }

  getCategoryID(category) {
    // Get ID for Category

    switch (category) {
      case 'General Knowledge':
        return '9';

      case 'Books':
        return '10';

      case 'Film':
        return '11';

      case 'Music':
        return '12';

      case 'Musicals & Theatres':
        return '13';

      case 'TV':
        return '14';

      case 'Video Games':
        return '15';

      case 'Board Games':
        return '16';

      case 'Science & Nature':
        return '17';

      case 'Computers':
        return '18';

      case 'Mathematics':
        return '19';

      case 'Mythology':
        return '20';

      case 'Sports':
        return '21';

      case 'Geography':
        return '22';

      case 'History':
        return '23';

      case 'Politics':
        return '24';

      case 'Art':
        return '25';

      case 'Celebrities':
        return '26';

      case 'Animals':
        return '27';

      case 'Vehicles':
        return '28';

      case 'Comics':
        return '29';

      case 'Gadgets':
        return '30';

      case 'Anime & Manga':
        return '31';

      case 'Cartoon & Animations':
        return '32';

      default:
        return '9';
    }
  }
}

module.exports = Game;
