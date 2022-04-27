const { v4: uuidv4 } = require('uuid');
const JWT = require('../controllers/JWT');
const Password = require('../controllers/Password');

const UserSchema = require('../models/UserSchema');
const CurrentlyOnlineSchema = require('../models/CurrentlyOnlineSchema');
const User = require('../classes/User');

const randomUserName = require('../classes/randomUsername');

async function createNewUser(password, isGuest, email) {
  // Standart Skins for every UserSchema
  const startSkins = ['red', 'blue', 'black'];

  const id = uuidv4();
  const username = randomUserName.generateName();

  // Create Instance from UserSchema
  const newUser = new UserSchema({
    username: username,
    email: email,
    password: Password.encrypt(password), // Encrypt Passwort
    id: id,
    token: JWT.generate(username, email, id), // Generate new Token
    currentSkin: startSkins[Math.floor(Math.random() * 3)], // Choose random Skin
    experience: 0,
    gold: 0,
    level: 1,
    isOnline: false,
    isGuest: isGuest,
    skins: startSkins,
    friends: [],
    friendRequestsIncoming: [],
    friendRequestsOutgoing: [],
  });

  await newUser.save();

  // If User is a Guest, return the User-Object. Else return "Success" for Registration
  return isGuest ? newUser : 'Success';
}

async function getUserById(id) {
  // Get Userdata from users-Collection without critical data, like Password
  const user = await UserSchema.findById(id).catch(() => 'Error');
  return user === 'Error' || user === null
    ? 'Error: ID invalid!'
    : new User(user, user.token);
}

async function getUserBySocketID(socketID) {
  // Get Userdata from currentlyonlines-Collection

  const user = await CurrentlyOnlineSchema.findOne({
    socketID: socketID,
  }).catch(() => 'Error');
  return user === 'Error' || user === null ? 'Error: ID invalid!' : user;
}

async function getUserByMail(email) {
  // Get all Userdata´s from users-Collection, including critical data (like Password)
  return await UserSchema.find({ email: email });
}

async function deleteUser(id) {
  // Delete a User from users-Collection
  const deletedCount = (await UserSchema.deleteOne({ _id: id })).deletedCount;
  return deletedCount === 0 ? false : true;
}

async function updateUser(
  id,
  newUsername,
  oldPassword,
  newPassword,
  newSkin,
  newEmail
) {
  // Get all Userdata´s from users-Collection, including critical data (like Password)
  const user = await getUserById(id);

  // If no User was found, return with Error
  if (!user) return 'Error: Wrong ID!';

  if (user !== null) {
    // If User wants to change the Username, no Pasword is required
    if (newUsername) {
      await UserSchema.findByIdAndUpdate(
        { _id: id },
        { username: newUsername }
      );
      return 'Success';
    }

    if (newPassword) {
      // If User wants to change the Password, the old Pasword is required
      const check = Password.check(oldPassword, user.password, user.username);

      if (check) {
        await UserSchema.findByIdAndUpdate(
          { _id: id },
          { password: Password.encrypt(newPassword) }
        );
        return 'Success';
      } else {
        return 'Wrong Password';
      }
    }

    if (newSkin) {
      // If User wants to change the Skin, no Pasword is required
      await UserSchema.findByIdAndUpdate({ _id: id }, { currentSkin: newSkin });
      return 'Success';
    }

    if (newEmail) {
      // If User wants to change the Email, a Pasword is required
      const check = Password.check(oldPassword, user.password, user.username);

      if (check) {
        await UserSchema.findByIdAndUpdate({ _id: id }, { email: newEmail });
        return 'Success';
      } else {
        return 'Wrong Password';
      }
    }
  } else {
    return 'Wrong ID. Please report to Admin';
  }
}

async function updateToken(id, token) {
  // Return a new Token, if the old one is expired
  await UserSchema.findByIdAndUpdate({ _id: id }, { token: token });
}

async function changeOnlineState(data, socketID) {
  // Try to get User by SocketID (For Disconnect)
  const currentUser = await getUserBySocketID(socketID);

  // Get ID from data if User is connecting. If User disconnects, get ID from currentlyonlines-Collection
  const id =
    currentUser === 'Error: ID invalid!' ? data.userID : currentUser.userID;

  // Get User by ID
  const user = await getUserById(id);

  // If now User is null, return Error
  if (!user) return 'Error: Wrong ID!';

  if (user !== null) {
    // Update users-Collection >>> Change isOnline-Boolean
    await UserSchema.findByIdAndUpdate(
      { _id: user.id },
      { isOnline: data.online }
    );

    if (!data.online) {
      // If User logs out, delete him/her from currentlyonline-Collection
      await CurrentlyOnlineSchema.deleteOne({ userID: user.id });
      return 'Logged Out';
    }

    if (!(await CurrentlyOnlineSchema.findById(user.id).catch())) {
      // If User is not already in Collection, add him/her to currentlyonlines-Collection
      await new CurrentlyOnlineSchema({
        username: user.username,
        isGuest: user.isGuest,
        userID: user.id,
        socketID: socketID,
      }).save();
    }

    return 'Logged In';
  } else {
    return 'Wrong ID. Please report to Admin';
  }
}

module.exports = {
  createNewUser,
  getUserById,
  getUserByMail,
  deleteUser,
  updateUser,
  changeOnlineState,
  updateToken,
};
