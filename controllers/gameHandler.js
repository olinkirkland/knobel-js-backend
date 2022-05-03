const axios = require('axios');

const UserHandler = require('./UserHandler');
const UserSchema = require('../models/UserSchema');
const Game = require('../classes/Game');

async function getQuestions(options) {
  // Extract Options

  const difficulty = options.difficulty
    ? `&difficulty=${options.difficulty}`
    : '';
  const type = options.type ? `&type=${options.type}` : '&type=multiple';
  const amount = options.amount ? `&amount=${options.amount}` : 'amount=10';
  const category = options.category
    ? `&category=${getCategoryID(options.category)}`
    : '';

  // Build URL from Options

  const url = `https://opentdb.com/api.php?${
    amount + type + difficulty + category
  }`;

  // Fetch Questions

  return (await axios.get(url)).data.results;
}

function categoriesCatalog() {
  // Return all avaible Categories

  return [
    'General Knowledge',
    'Books',
    'Film',
    'Music',
    'Musicals & Theatres',
    'TV',
    'Video Games',
    'Board Games',
    'Science & Nature',
    'Computers',
    'Mathematics',
    'Mythology',
    'Sports',
    'Geography',
    'History',
    'Politics',
    'Art',
    'Celebrities',
    'Gadgets',
    'Animals',
    'Vehicles',
    'Comics',
    'Anime & Manga',
    'Cartoon & Animations',
  ];
}

function getCategoryID(category) {
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

async function newGame(options) {
  const Game = new Game(options);
}

module.exports = {
  getQuestions,
  categoriesCatalog,
};
