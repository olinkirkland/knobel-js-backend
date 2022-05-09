class User {
  constructor(userSchema, token) {
    // General
    this.id = userSchema._id.toString(); // The user's id, used to lookup in DB
    this.username = userSchema.username; // The user's username, chosen by the user
    this.email = userSchema.email; // The user's email address
    this.isGuest = userSchema.isGuest; // Whether the user is a guest or not
    this.socketID = userSchema.socketID; // The user's socket ID
    this.gameID = userSchema.currentRoom; // The user's current game

    // Customizations
    this.currentSkin = userSchema.currentSkin; // The user's current skin
    this.currentAvatar = userSchema.currentAvatar; // The user's current avatar
    this.currentWallpaper = userSchema.currentWallpaper; // The user's current wallpaper

    // Resources
    this.experience = userSchema.experience; // Experience
    this.level = userSchema.level; // Level (based off experience)
    this.gold = userSchema.gold; // Gold, used to purchase items

    // Social
    this.friends = userSchema.friends; // Friends
    this.friendRequestsIncoming = userSchema.friendRequestsIncoming; // Incoming friend requests
    this.friendRequestsOutgoing = userSchema.friendRequestsOutgoing; // Outgoing friend requests

    // Items
    this.inventory = userSchema.inventory; // An array of item IDs that correspond to items owned by the user
  }

  toPlayerData() {
    // Packaged object containing only the information needed for in-game players
    return {
      id: this.id,
      username: this.username,
      currentAvatar: this.currentAvatar,
      level: this.level,
      isGuest: this.isGuest
    };
  }
}

// Minimal public-facing user data
class Small {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.currentAvatar = data.currentAvatar;
    this.level = data.level;
    this.isGuest = data.isGuest;
    this.isOnline = data.isOnline;
  }
}

// Regular user data intended for foreign users viewing profile data
class Medium extends Small {
  constructor(data) {
    super(data);
    this.currentSkin = data.currentSkin;
    this.experience = data.experience;
    this.skins = data.skins;
    this.friends = data.friends;
    this.status = data.status;
  }
}

// User data intended for users viewing their own profile data
class Full extends Medium {
  constructor(data) {
    super(data);
    this.email = data.email;
    this.gold = data.gold;
    this.socketID = data.socketID;
    this.gameID = data.currentRoom;
    this.nameChanges = data.nameChanges;
    this.currentWallpaper = data.currentWallpaper;
    this.friendRequestsIncoming = data.friendRequestsIncoming;
    this.friendRequestsOutgoing = data.friendRequestsOutgoing;
    this.inventory = data.inventory;
  }
}

module.exports = { User, Full, Medium, Small };
