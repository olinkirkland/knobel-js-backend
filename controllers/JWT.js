require('dotenv').config();

const jwt = require('jsonwebtoken');

// Configs for Cookie-Security
const options = {
  maxAge: 1000 * 60 * 60 * 24, // Expires after 24h
  httpOnly: true,
  signed: true,
  sameSite: 'none',
  secure: true,
  path: '/',
};

const maxAge = 3600; // Define the maxAge for the Token in seconds! <<<<<<<<<<<<

function generate(username, email, id) {
  // Returns a new Token generated with a secret Password. Contents: Username, Timestamp in s (iat)

  return jwt.sign(
    {
      username: username,
      email: email,
      id: id,
    },
    process.env.SECRET
  );
}

function check(req, res, next) {
  // Returns true if the Token is Valid, else it returns a Errormessage
  // Check if the Token is valid. Needs a maxAge as String (Default: ms, possible: 12s, 12min, 12h, 12d)

  // Extract Token from Request-Cookie
  const token = req.signedCookies.Token;

  return jwt.verify(
    token,
    process.env.SECRET,
    { maxAge: maxAge + 1800 },
    (err, decode) => {
      const currentTime = new Date().getTime() / 1000;

      if (currentTime - decode.iat >= maxAge) {
        res.cookie(
          'Token',
          generate(decode.username, decode.email, decode.id),
          options
        );
      }

      if (err) {
        // Handle Errors

        if (err.name === 'TokenExpiredError') {
          res.send(`TokenExpiredError: Expired at ${err.expiredAt}`);
        } else if (err.name === 'invalid token') {
          res.send(`Token is not Valid!`);
        } else {
          res.send(err);
        }
      } else {
        // If Token is valid

        next();
      }
    }
  );
}

module.exports = { generate, check };
