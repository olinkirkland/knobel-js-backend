const JWT = require('../controllers/JWT');

// Configs for Cookie-Security
const options = {
  maxAge: 1000 * 60 * 60 * 24, // Expires after 24h
  httpOnly: true,
  signed: true,
  sameSite: 'none',
  secure: true,
};

async function createCookie(isGuest, user, token) {
  if (isGuest) {
    cookieContent = {
      name: 'Token',
      token: JWT.generate(user.username, user.email, user.id),
      options,
    };
    return cookieContent;
  } else {
    cookieContent = { name: 'Token', token, options };
    return cookieContent;
  }
}

module.exports = { createCookie };
