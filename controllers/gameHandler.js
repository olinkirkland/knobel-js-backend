const axios = require('axios');

const UserHandler = require('./UserHandler');
const UserSchema = require('../models/UserSchema');

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

async function checkLevel(userID) {
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

module.exports = { getQuestions, categoriesCatalog, checkLevel };
