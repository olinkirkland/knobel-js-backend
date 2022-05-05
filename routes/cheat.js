const express = require('express');
const router = express.Router();

const {
  giveItem,
  giveExperience,
  giveGold
} = require('../controllers/ResourceHandler');

const JWT = require('../controllers/JWT');
const UserSchema = require('../models/UserSchema');

router.post('/', JWT.check, (req, res) => {
  let id = req.body.userID;
  let type = req.query.type;
  let value = req.query.value;

  if (type == 'item') giveItem(id, value);
  else if (type == 'experience') giveExperience(id, value);
  else if (type == 'gold') giveGold(id, value);
  else console.log('⚠️', 'Unknown type', `'${type}'`);
});

module.exports = router;
