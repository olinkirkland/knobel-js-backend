const UserSchema = require("../models/UserSchema");
const User = require("../classes/User");
const { experienceNeededFromLevel } = require("../utils/Util");
const { Connection } = require("./Connection");

async function giveItem(userId, itemId) {
  // Get the user's current inventory
  const userSchema = await UserSchema.findOne({ id: userId });
  userSchema.inventory.push(itemId);
  userSchema.save();

  // Console log inventory
  // console.log(
  //   "🗃️",
  //   userSchema.inventory.map((item) => item)
  // );
  Connection.invalidateUserBySocketID(userSchema.socketID);
}

async function giveExperience(userId, amount) {
  // Add an amount of experience to the user's experience
  const userSchema = await UserSchema.findOne({ id: userId });
  let experience = parseInt(userSchema.experience);

  console.log(
    "✨",
    `${userSchema.username} received +${amount} experience (${experience} -> ${
      experience + parseInt(amount)
    })`
  );

  experience += parseInt(amount);
  while (experience > experienceNeededFromLevel(userSchema.level)) {
    // Level up
    userSchema.level = parseInt(userSchema.level) + 1;
    experience -= experienceNeededFromLevel(userSchema.level);
    giveLevelUpRewards(userSchema);
    console.log(
      "🌟",
      userSchema.username,
      `leveled up (${userSchema.level - 1} -> ${userSchema.level})`
    );
  }

  userSchema.experience = experience;

  userSchema.save();
  Connection.invalidateUserBySocketID(userSchema.socketID);
}

function giveLevelUpRewards(userSchema) {
  // Give the user some rewards for level up
  userSchema.gold += 10;
}

async function giveGold(userId, amount) {
  console.log('giving', amount, 'gold to', userId);
  // Add an amount of gold to the user's gold
  const userSchema = await UserSchema.findOne({ id: userId });
  let gold = parseInt(userSchema.gold);

  console.log(
    "💸",
    `${userSchema.username} received +${amount} gold (${gold} -> ${
      gold + parseInt(amount)
    })`
  );

  gold += parseInt(amount);
  userSchema.gold = gold;
  userSchema.save();
  Connection.invalidateUserBySocketID(userSchema.socketID);
}

module.exports = {
  giveItem,
  giveExperience,
  giveGold
};
