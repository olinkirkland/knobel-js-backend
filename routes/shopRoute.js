const express = require("express");
const router = express.Router();

const JWT = require("../controllers/JWT");
const gameHandler = require("../game/GameData");
const UserHandler = require("../controllers/UserHandler");
const Arcade = require("../game/Arcade");

const UserSchema = require("../models/UserSchema");

const shop = require("../shop.json");

router.post("/buy", JWT.check, async (req, res) => {
  if (!req.body.userID || !req.body.itemID) {
    res.status(400).send("Bad Request - UserID, ItemID requiered!");
    return;
  }

  const user = await UserHandler.getFullUserById(req.body.userID);
  const itemID = req.body.itemID;

  const item = shop.avatars.find((item) => item.id === itemID);

  if (!item || item === "undefined" || item == null) {
    res.status(400).send("Bad Request - UserID, ItemID requiered!");
    return;
  }

  if (user.gold >= item.cost) {
    console.log(user.inventory);
    user.inventory.push(item.id);
    console.log(user.inventory);
    user.gold = user.gold - item.cost;
    await UserSchema.updateOne(
      { id: user.id },
      { gold: user.gold, inventory: user.inventory }
    );
    res.status(201).send(item);
    return;
  } else {
    res.status(402).send("You don't have enough Money!");
    return;
  }
});

module.exports = router;
