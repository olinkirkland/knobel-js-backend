class User {
  // Create User-Object for Response to Frontend without critical Data like Password
  constructor(data, token) {
    this.username = data.username;
    this.email = data.email;
    this.id = data._id;
    this.currentSkin = data.currentSkin;
    this.currentAvatar = data.currentAvatar;
    this.currentWallpaper = data.currentWallpaper;
    this.experience = data.experience;
    this.gold = data.gold;
    this.level = data.level;
    this.skins = data.skins;
    this.friends = data.friends;
    this.friendRequestsIncoming = data.friendRequestsIncoming;
    this.friendRequestsOutgoing = data.friendRequestsOutgoing;
    this.isGuest = data.isGuest;
    this.inventory = data.inventory;
  }
}

// Minimal public-facing user data
class Small {
  constructor(data) {
    this.id = data._id.valueOf();
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
    this.nameChanges = data.nameChanges;
    this.currentWallpaper = data.currentWallpaper;
    this.friendRequestsIncoming = data.friendRequestsIncoming;
    this.friendRequestsOutgoing = data.friendRequestsOutgoing;
    this.currentRoom = data.currentRoom;
    this.inventory = data.inventory;
  }
}

module.exports = { Full, Medium, Small };
