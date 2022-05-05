const express = require('express');
const router = express.Router();

const JWT = require('../controllers/JWT');
const UserSchema = require('../models/UserSchema');

router.post('/', JWT.check, (req, res) => {
  let id = req.body.userID;
  // Return the user's inventory
});

module.exports = router;
