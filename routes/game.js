const express = require('express');
const router = express.Router();

const { v4: uuidv4 } = require('uuid');
const JWT = require('../controllers/JWT');
const gameHandler = require('../controllers/gameHandler');
const Game = require('../classes/Game');

const currentGames = [];

router.post('/', JWT.check, (req, res) => {
  // Return an Array with Objects of Questions, depending on the choice of Options.
  // Options:
  // difficulty: easy || medium || hard
  // type: mutliple || boolean (If empty: mutliple)
  // amount: 1 - 50 (If empty: 10)
  // category: One of all Categories as String (Request /categories to see Options)

  const options = req.body;
  gameHandler.getQuestions(options).then((response) => res.send(response));
});

router.get('/categories', JWT.check, (req, res) => {
  // Return avaible Categories for Questions as an Array
  res.send(gameHandler.categoriesCatalog());
});

router.post('/host', JWT.check, (req, res) => {
  const options = req.body.options;

  if (currentGames.find((el) => el.name === options.name)?.name) {
    res.status(400).send('Name is unavaible');
  } else {
    const newGame = new Game(options);
    currentGames.push(newGame);

    res.status(201).send(newGame);
  }
});

router.get('/currentgames', JWT.check, (req, res) => {
  res.send(currentGames);
});

module.exports = router;
