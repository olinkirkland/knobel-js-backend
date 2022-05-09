const { v4: uuidv4 } = require("uuid");
const JWT = require("../controllers/JWT");
const Password = require("../controllers/Password");

const UserSchema = require("../models/UserSchema");
const CurrentlyOnlineSchema = require("../models/CurrentlyOnlineSchema");
const { User, Small, Medium, Full } = require("../classes/User");
const FriendsSchema = require("../models/FriendsSchema");

const randomUserName = require("../classes/randomUsername");
const { Connection, ConnectionEventType } = require("./Connection");

// Connection listeners
Connection.instance.on(ConnectionEventType.CONNECT, (socketID, data) => {
  changeOnlineState(data, socketID);
});

Connection.instance.on(ConnectionEventType.DISCONNECT, (socketID) => {
  changeOnlineState({ online: false }, socketID);
});

async function createNewUser(password, isGuest, email) {
  // Standart Skins for every UserSchema
  const startSkins = ["red", "blue", "black"];

  const id = uuidv4();
  const username = randomUserName.generateName();

  // Create Instance from UserSchema
  const newUser = new UserSchema({
    username: username,
    email: email,
    password: Password.encrypt(password), // Encrypt Passwort
    id: id,
    token: JWT.generate(username, email, id), // Generate new Token
    experience: 0,
    gold: 0,
    level: 1,
    isOnline: false,
    isGuest: isGuest,
    friends: [],
    friendRequestsIncoming: [],
    friendRequestsOutgoing: [],
    nameChanges: 0,
    currentAvatar: "oO7GXCjER0DbQioa2Mwqx",
    currentWallpaper: "nbKnDUBgYwiQcUJjI8gYG",
    currentSkin: startSkins[Math.floor(Math.random() * 3)], // Choose random Skin
    inventory: [
      "oO7GXCjER0DbQioa2Mwqx", // Viking (Avatar)
      "Gpm00ST2s7WypfINoDx4i", // Day of the Dead (Avatar)
      "LgzPFDYuFg53oV8Q0CnG3", // Corgi (Avatar)
      "nbKnDUBgYwiQcUJjI8gYG", // Prism (Wallpaper)
      "KgkdXnvuUjgFg9mFsF_o1" // Embroidery (Wallpaper)
    ],
    status: "Guests like to keep their secrets..."
  });

  await newUser.save();

  // If User is a Guest, return the User-Object. Else return "Success" for Registration
  return isGuest ? newUser : "Success";
}

async function getUserSchemaById(id) {
  return await UserSchema.findOne({ id: id });
}

async function getUserById(id) {
  const userSchema = await getUserSchemaById(id);
  return new User(userSchema);
}

async function getFullUserById(id) {
  // Get Userdata from users-Collection without critical data, like Password

  const user = await UserSchema.findOne({ id: id }).catch(() => "Error");
  return user === "Error" || user === null
    ? "Error: ID invalid!"
    : new Full(user);
}

async function getMediumUserById(id) {
  // Get Userdata from users-Collection without critical data, like Password

  const user = await UserSchema.findOne({ id: id }).catch(() => "Error");
  return user === "Error" || user === null
    ? "Error: ID invalid!"
    : new User.Medium(user);
}

async function getSmallUserById(id) {
  // Get Userdata from users-Collection without critical data, like Password

  const user = await UserSchema.findOne({ id: id }).catch(() => "Error");
  return user[0] === "Error" || user[0] === null
    ? "Error: ID invalid!"
    : new User.Small(user);
}

async function getUserSchemaBySocketID(socketID) {
  // Get Userdata from currentlyonlines-Collection
  const user = await UserSchema.findOne({
    socketID: socketID
  }).catch(() => "Error");

  return user;
}

async function getUserByMail(email) {
  // Get all Userdata´s from users-Collection, including critical data (like Password)
  return await UserSchema.findOne({ email: email });
}

async function deleteUser(id) {
  // Delete a User from users-Collection
  const deletedCount = (await UserSchema.deleteOne({ id: id })).deletedCount;
  return deletedCount === 0 ? false : true;
}

async function updateUser(
  id,
  newUsername,
  oldPassword,
  newPassword,
  newSkin,
  newEmail,
  newAvatar,
  newWallpaper,
  newStatus
) {
  // Get all Userdata´s from users-Collection, including critical data (like Password)
  const userSchema = await getUserSchemaById(id);
  const user = new Full(userSchema);
  let result = "";

  // If no User was found, return with Error
  if (!user) result = 400;

  if (user !== null) {
    // If User wants to change the Username, no Pasword is required
    if (newUsername) {
      await UserSchema.updateOne({ id: id }, { username: newUsername });
    }

    if (newPassword) {
      // If User wants to change the Password, the old Pasword is required
      const check = Password.check(
        oldPassword,
        userSchema.password,
        user.username
      );

      if (check) {
        await UserSchema.updateOne(
          { id: id },
          { password: Password.encrypt(newPassword) }
        );
      } else {
        return 401;
      }
    }

    if (newSkin) {
      // If User wants to change the Skin, no Pasword is required
      await UserSchema.updateOne({ id: id }, { currentSkin: newSkin });
    }

    if (newAvatar) {
      await UserSchema.updateOne({ id: id }, { currentAvatar: newAvatar });
    }

    if (newWallpaper) {
      await UserSchema.updateOne(
        { id: id },
        { currentWallpaper: newWallpaper }
      );
    }

    if (newStatus) {
      await UserSchema.updateOne({ id: id }, { status: newStatus });
    }

    if (newEmail) {
      // If User wants to change the Email, a Pasword is required
      const check = Password.check(
        oldPassword,
        userSchema.password,
        user.username
      );

      if (check) {
        await UserSchema.updateOne(
          { id: id },
          { email: newEmail.toLowerCase() }
        );
        console.log("user", user.username, "changed their Email to", newEmail);
      } else {
        return 400;
      }
    }
  }

  Connection.invalidateUserBySocketID(user.socketID);

  if (result !== "Wrong Password" || result !== "Wrong ID") {
    return getFullUserById(id);
  } else {
    if (result === "Wrong Password") {
      return 401;
    } else {
      return 400;
    }
  }
}

async function upgradeGuest(email, password, id) {
  // Get all Userdata´s from users-Collection, including critical data (like Password)
  const user = await getFullUserById(id);

  // If no User was found, return with 404. If ID is invalid, return 400
  if (!user) return 404;
  if (user === "Error: ID invalid!") return 400;

  const hashed = Password.encrypt(password);

  if (user !== null) {
    await UserSchema.updateOne(
      { id: id },
      { password: hashed, email: email, isGuest: false, nameChanges: 1 }
    );

    Connection.invalidateUserBySocketID(user.socketID);

    console.log(
      "✔️",
      user.username,
      "registered their account with email",
      email
    );

    return 201;
  }
}

async function updateToken(id, token) {
  // Return a new Token, if the old one is expired
  await UserSchema.updateOne({ id: id }, { token: token });
}

async function changeOnlineState(data, socketID) {
  // Try to get User by SocketID (For Disconnect)
  const currentUser = await getUserSchemaBySocketID(socketID);

  // Get ID from data if User is connecting. If User disconnects, get ID from currentlyonlines-Collection
  const id = currentUser ? currentUser.userID : data.userID;

  // Get User by ID
  const user = await getFullUserById(id);

  // If now User is null, return Error
  if (!user) return "Error: Wrong ID!";

  if (user !== null) {
    // Update users-Collection >>> Change isOnline-Boolean = true
    if (data.online) {
      await UserSchema.updateOne(
        { id: user.id },
        { isOnline: data.online, socketID: socketID }
      );
    }

    if (!data.online) {
      if (currentUser.isGuest) {
        deleteUser(currentUser.id);
      } else {
        // Update users-Collection >>> Change isOnline-Boolean = false
        await UserSchema.updateOne(
          { id: currentUser._id },
          { isOnline: data.online, socketID: "" }
        );
      }

      return "Logged Out";
    }

    return "Logged In";
  } else {
    return "Wrong ID. Please report to Admin";
  }
}

async function changeSocketRoom(user, partner) {
  let error = "";
  const friendsID = uuidv4();

  // Construct new Friendship and save in DB
  await new FriendsSchema({
    friendsID: friendsID,
    users: [
      {
        username: user.username,
        userID: user.userID
      },
      {
        username: partner.username,
        userID: partner.userID
      }
    ]
  })
    .save()
    .catch((err) => (error = `Error: ${err}`));

  // Get current User-Data and update the Friendslist with the Partnerdata
  let userDB = await UserSchema.findOne({ id: user.userID });
  userDB.friends.push({
    userID: partner.userID,
    username: partner.username,
    friendsID: friendsID
  });
  await UserSchema.findOne(
    { id: user.userID },
    { friends: userDB.friends }
  ).catch((err) => (error = `Error: ${err}`));

  // Get current Partner-Data and update the Friendslist with the User-data
  let partnerDB = await UserSchema.findOne({ id: partner.userID });
  partnerDB.friends
    .push({
      userID: user.userID,
      username: user.username,
      friendsID: friendsID
    })
    .catch((err) => (error = `Error: ${err}`));

  if (!error) {
    return "success";
  } else {
    return error;
  }
}

module.exports = {
  createNewUser,
  getUserSchemaById,
  getUserById,
  getFullUserById,
  getMediumUserById,
  getSmallUserById,
  getUserByMail,
  getUserSchemaBySocketID,
  deleteUser,
  updateUser,
  changeOnlineState,
  updateToken,
  changeSocketRoom,
  upgradeGuest
};
