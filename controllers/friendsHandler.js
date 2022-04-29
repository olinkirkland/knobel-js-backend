const { v4: uuidv4 } = require('uuid');
const UserSchema = require('../models/UserSchema');
const Friends = require('../models/FriendsSchema');
const { Socket } = require('socket.io');

async function createRequest(requestGiver, requestTarget) {
  let error = '';

  /*    ****    ****    ****    */
  /*    Update  requestGiver    */
  /*    ****    ****    ****    */

  // Get current Requests to other Users
  const currentRequestGiver = await UserSchema.findById({
    _id: requestGiver,
  }).catch(() => (error = 512));

  // Check if Query was successful
  if (currentRequestGiver == 'undefined' || currentRequestGiver == null)
    return 400;
  // Add new Request
  currentRequestGiver.friendRequestsOutgoing.push(requestTarget);

  // Update DB
  await UserSchema.findByIdAndUpdate(
    { _id: requestGiver },
    { friendRequestsOutgoing: currentRequestGiver.friendRequestsOutgoing }
  ).catch((err) => (error = err));

  /*    ****    ****    ****    */
  /*    Update requestTarget    */
  /*    ****    ****    ****    */

  // Get current Requests to other Users
  const currentRequestTarget = await UserSchema.findById({
    _id: requestTarget,
  }).catch(() => (error = 512));

  // Check if Query was successful
  if (currentRequestTarget == 'undefined' || currentRequestTarget == null)
    return 400;

  // Add new Request
  currentRequestTarget.friendRequestsIncoming.push(requestGiver);
  // Update DB
  await UserSchema.findByIdAndUpdate(
    { _id: requestTarget },
    { friendRequestsIncoming: currentRequestTarget.friendRequestsIncoming }
  ).catch((err) => (error = err));

  /*    ****    ****    ****    */
  /*           Socket           */
  /*    ****    ****    ****    */

  if (requestTarget.isOnline) {
    socket
      .to(requestTarget.socketID)
      .emit('friend-request-incoming', requestGiver.userID);
  }

  /*    ****    ****    ****    */
  /*           Return           */
  /*    ****    ****    ****    */

  // If an Error occured, return false
  if (error !== '') return error;

  // Return true, if Request succeeded
  return true;
}

async function acceptRequest(requestGiver, requestTarget) {
  let error = '';

  /*    ****    ****    ****    */
  /*    Update  requestGiver    */
  /*    ****    ****    ****    */

  // Get current Requests to other Users
  const currentRequestGiver = await UserSchema.findById({
    _id: requestGiver,
  }).catch(() => (error = 512));

  if (error !== '') return error;

  // Check if Query was successful
  if (currentRequestGiver == 'undefined' || currentRequestGiver == null)
    return 400;

  // Remove Request
  currentRequestGiver.friendRequestsOutgoing.splice(
    currentRequestGiver.friendRequestsOutgoing.indexOf(requestTarget),
    1
  );

  // Add new Friend to friends
  currentRequestGiver.friends.push(requestTarget);

  // Update DB
  await UserSchema.findByIdAndUpdate(
    { _id: requestGiver },
    {
      friendRequestsOutgoing: currentRequestGiver.friendRequestsOutgoing,
      friends: currentRequestGiver.friends,
    }
  ).catch((err) => (error = err));

  /*    ****    ****    ****    */
  /*    Update requestTarget    */
  /*    ****    ****    ****    */

  // Get current Requests to other Users
  const currentRequestTarget = await UserSchema.findById({
    _id: requestTarget,
  }).catch(() => (error = 512));

  // Check if Query was successful
  if (currentRequestTarget == 'undefined' || currentRequestTarget == null)
    return 400;

  // Remove Request
  currentRequestTarget.friendRequestsIncoming.splice(
    currentRequestTarget.friendRequestsIncoming.indexOf(requestGiver),
    1
  );

  // Add new Friend to friends
  currentRequestTarget.friends.push(requestGiver);

  // Update DB
  await UserSchema.findByIdAndUpdate(
    { _id: requestTarget },
    {
      friendRequestsIncoming: currentRequestTarget.friendRequestsIncoming,
      friends: currentRequestTarget.friends,
    }
  ).catch((err) => (error = err));

  /*    ****    ****    ****    */
  /*  Update friendsCollection  */
  /*    ****    ****    ****    */

  new Friends({
    friendsID: uuidv4(),
    users: [requestGiver, requestTarget],
  }).save();

  /*    ****    ****    ****    */
  /*           Socket           */
  /*    ****    ****    ****    */

  // if (requestGiver.isOnline) {
  //   socket
  //     .to(requestGiver.socketID)
  //     .emit('friend-request-accepted', requestTarget.userID);
  // }

  // If an Error occured, return false
  if (error !== '') return error;

  // Return true, if Request succeeded
  return true;
}

async function declineRequest(requestGiver, requestTarget) {
  let error = '';

  /*    ****    ****    ****    */
  /*    Update  requestGiver    */
  /*    ****    ****    ****    */

  // Get current Requests to other Users
  const currentRequestGiver = await UserSchema.findById({
    _id: requestGiver,
  }).catch(() => (error = 512));

  if (error !== '') return error;

  // Check if Query was successful
  if (currentRequestGiver == 'undefined' || currentRequestGiver == null)
    return 400;

  // Remove Request
  currentRequestGiver.friendRequestsOutgoing.splice(
    currentRequestGiver.friendRequestsOutgoing.indexOf(requestTarget),
    1
  );

  // Update DB
  await UserSchema.findByIdAndUpdate(
    { _id: requestGiver },
    {
      friendRequestsOutgoing: currentRequestGiver.friendRequestsOutgoing,
    }
  ).catch((err) => (error = err));

  /*    ****    ****    ****    */
  /*    Update requestTarget    */
  /*    ****    ****    ****    */

  // Get current Requests to other Users
  const currentRequestTarget = await UserSchema.findById({
    _id: requestTarget,
  }).catch(() => (error = 512));

  // Check if Query was successful
  if (currentRequestTarget == 'undefined' || currentRequestTarget == null)
    return 400;

  // Remove Request
  currentRequestTarget.friendRequestsIncoming.splice(
    currentRequestTarget.friendRequestsIncoming.indexOf(requestGiver),
    1
  );

  // Update DB
  await UserSchema.findByIdAndUpdate(
    { _id: requestTarget },
    {
      friendRequestsIncoming: currentRequestTarget.friendRequestsIncoming,
    }
  ).catch((err) => (error = err));

  /*    ****    ****    ****    */
  /*           Socket           */
  /*    ****    ****    ****    */

  // if (requestGiver.isOnline) {
  //   socket
  //     .to(requestGiver.socketID)
  //     .emit('friend-request-accepted', requestTarget.userID);
  // }

  // If an Error occured, return false
  if (error !== '') return error;

  // Return true, if Request succeeded
  return true;
}

module.exports = { createRequest, acceptRequest, declineRequest };
