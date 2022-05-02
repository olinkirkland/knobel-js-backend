const express = require('express');
const router = express.Router();

const JWT = require('../controllers/JWT');
const Game = require('../controllers/gameHandler');

router.post('/', /* JWT.check, */ (req, res) => {
  // Return an Array with Objects of Questions, depending on the choice of Options.
  // Options:
  // difficulty: easy || medium || hard
  // type: mutliple || boolean (If empty: mutliple)
  // amount: 1 - 50 (If empty: 10)
  // category: One of all Categories as String (Request /categories to see Options)

  const options = req.body;
  Game.getQuestions(options).then((response) => res.send(response));
});

router.get('/categories', JWT.check, (req, res) => {
  // Return avaible Categories for Questions as an Array
  res.send(Game.categoriesCatalog());
});

module.exports = router;
