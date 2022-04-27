class User {
  // Create User-Object for Response to Frontend without critical Data like Password
  constructor(data, token) {
    this.username = data.username;
    this.id = data._id;
    this.token = token;
    this.currentSkin = data.currentSkin;
    this.experience = data.experience;
    this.gold = data.gold;
    this.level = data.level;
    this.skins = data.skins;
    this.friends = data.friends;
    this.friendRequestsIncoming = data.friendRequestsIncoming;
    this.friendRequestsOutgoing = data.friendRequestsOutgoing;
    this.isGuest = data.isGuest;
  }
}

module.exports = User;
