const express = require("express");
const router = express.Router();

const JWT = require("../controllers/JWT");
const gameHandler = require("../game/GameData");
const UserHandler = require("../controllers/UserHandler");
const Arcade = require("../game/Arcade");

const UserSchema = require("../models/UserSchema");

const shop = require("../shop.json");

const { Connection } = require("../controllers/Connection");
const { giveItem, giveGold } = require("../controllers/ResourceHandler");

router.get("/", (req, res) => {
  res.send(shop);
});

router.post("/buy", JWT.check, async (req, res) => {
  if (!req.body.userID || !req.body.itemID) {
    res.status(400).send("Bad Request - UserID requiered!");
    return;
  }

  const user = await UserHandler.getUserById(req.body.userID);

  if (user.inventory.indexOf(req.body.itemID) !== -1) {
    res.status(400).send("Bad Request - User already has this item!");
    return;
  }

  const item = shop.prices.find((price) => price.id === req.body.itemID);
  if (!item) {
    res.status(400).send("Bad Request - ItemID requiered!");
    return;
  }

  const price = getItemPrice(item);
  if (user.gold >= price) {
    giveItem(user.id, item.id);
    giveGold(user.id, -price);
  } else {
    res.status(402).send("You don't have enough Money!");
  }
});

function getItemPrice(item) {
  console.log(item.id, "base price:", item.price);
  let discount = 0;
  shop.sales.forEach((sale) => {
    sale.discounts.forEach((d) => {
      if (d.id === item.id) discount = d.percent;
    });
  });

  let price = item.price - item.price * (discount / 100);
  console.log("with a discount of", `${discount}%`, "the price is:", price);
  return price;
}

module.exports = router;
