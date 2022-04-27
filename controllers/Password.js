require('dotenv').config();

const bcrypt = require('bcrypt');
const JWT = require('./JWT');

function encrypt(plaintextPassword) {
  // Return a hash from plaintext
  return bcrypt.hashSync(plaintextPassword, parseInt(process.env.SALT));
}

function check(plaintextPassword, hashedPassword, username) {
  // Return Token if Password is Validsss || False if Password is Invalid
  if (bcrypt.compareSync(plaintextPassword, hashedPassword)) {
    // If Password is Valid, generate a new Token
    return true;
  } else {
    return false;
  }
}

module.exports = { encrypt, check };
