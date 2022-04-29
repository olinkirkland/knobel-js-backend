const express = require('express');
const router = express.Router();

const JWT = require('../controllers/JWT');
const UserSchema = require('../models/UserSchema');

router.post(
  '/',
  /* JWT.check, */ (req, res) => {
    const xp = req.query.xp;
    const gold = req.query.gold;
    const lvl = req.query.lvl;
    const id = req.body.userID;
    let error = '';

    if (typeof xp !== 'undefined') {
      xp = xp < 0 ? xp * -1 : xp;
      options = { experience: xp };
    } else if (typeof gold !== 'undefined') {
      gold = gold < 0 ? gold * -1 : gold;
      options = { gold: gold };
    } else if (typeof lvl !== 'undefined') {
      lvl = lvl < 0 ? lvl * -1 : lvl;
      options = { lvl: lvl };
    }
    UserSchema.findByIdAndUpdate({ _id: id }, options).catch((err) => {
      error = err;
      console.log('Error at Cheat', error);
    });

    if (error !== '') {
      res.status(418).send('I am a Teapot!');
    } else {
      res.status(218).send('DoNe!11!!! ChEaTeR!!111!!');
    }
  }
);

module.exports = router;
