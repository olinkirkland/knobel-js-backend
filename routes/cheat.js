const express = require("express");
const router = express.Router();

const {
  giveItem,
  giveExperience,
  giveGold
} = require("../controllers/ResourceHandler");

const JWT = require("../controllers/JWT");
const UserSchema = require("../models/UserSchema");

router.post("/", JWT.check, (req, res) => {
  let id = req.body.userID;
  let type = req.query.type;
  let value = req.query.value;

  let success = true;
  if (type == "item") giveItem(id, value);
  else if (type == "experience") giveExperience(id, value);
  else if (type == "gold") giveGold(id, value);
  else success = false;

  if (success) res.status(200).send("Cheat successful");
  else res.status(400).send("Cheat failed");
});

module.exports = router;
