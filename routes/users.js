const express = require("express");
const router = express.Router();

const Password = require("../controllers/Password");
const JWT = require("../controllers/JWT");
const User = require("../classes/User");
const CookieMaker = require("../classes/CookieMaker");
const DataValidator = require("../controllers/DataValidator");

const UserHandler = require("../controllers/UserHandler");
const { Connection } = require("../controllers/Connection");

router.post("/login", DataValidator.checkEmail, (req, res) => {
  if (req.body.isGuest) {
    // Create new Guest with Standard PW and Email in DB
    UserHandler.createNewUser("123", true, "GUEST@GUEST.de").then((result) => {
      // Send User-Object to Frontend & Generate new Token
      const user = new User.Full(result);
      CookieMaker.createCookie(true, user).then((cookieContent) => {
        // Send user-Model to FrontEnd

        res.cookie(
          cookieContent.name,
          cookieContent.token,
          cookieContent.options
        );

        res.status(200).send(user.id);
      });
    });
  } else {
    UserHandler.getUserByMail(req.body.email.toLowerCase()).then((response) => {
      if (
        response !== null ||
        (response !== "undefined" && response.username)
      ) {
        const userSchema = response;

        // check Password with BCrypt and recieve new Token
        const check = Password.check(
          req.body.password,
          userSchema.password,
          userSchema.username
        );

        if (check) {
          // Create new User without critical Data like Password etc
          const user = new User.Full(userSchema);

          const token = JWT.generate(
            user.username,
            user.email.toLowerCase(),
            user.id
          );

          // Update Token in DB
          UserHandler.updateToken(user.id, token);
          CookieMaker.createCookie(false, user, token).then((cookieContent) => {
            // Send user-Model to FrontEnd
            res.cookie(
              cookieContent.name,
              cookieContent.token,
              cookieContent.options
            );
            res.send(user.id);
          });
        } else {
          // If Password is incorrect
          res.status(401).send("Wrong Password!");
        }
      } else {
        // If no User was found
        res.status(400).send(`User ${req.body.email.toLowerCase()} not Found`);
      }
    });
  }
});

router.post("/registrationTest", DataValidator.checkEmail, (req, res) => {
  if (process.env.DEV) {
    // Create new User in DB
    UserHandler.createNewUser(
      req.body.password,
      false,
      req.body.email.toLowerCase()
    ).then(res.send("Success"));
  } else {
    res.status(401).send("Only for Development");
  }
});

router.post(
  "/registration",
  JWT.check,
  DataValidator.checkEmail,
  (req, res) => {
    // Upgrade Guest to User
    UserHandler.upgradeGuest(
      req.body.email.toLowerCase(),
      req.body.password,
      req.body.userID
    ).then((response) => {
      if (response === 400) {
        res.status(400).send("Error: ID invalid. Please contact Support");
      } else if (response === 404) {
        res
          .status(404)
          .send("No User found with that ID. Please contact Support");
      } else if (response === 201) {
        res.status(201).send("Success");
      } else {
        res.status(500).send("Server Failed. Please contact Support");
      }
    });
  }
);

router.get("/delete", JWT.check, (req, res) => {
  // Delete a User in DB
  const id = req.query.id;
  UserHandler.deleteUser(id).then((response) => res.send(response));
});

router.post("/update", JWT.check, (req, res) => {
  // Update User | Must recieve ID!
  UserHandler.updateUser(
    req.body.id,
    req.body.newUsername,
    req.body.password,
    req.body.newPassword,
    req.body.newSkin,
    req.body.newEmail,
    req.body.newAvatar,
    req.body.newWallpaper,
    req.body.newStatus
  ).then((response) => {
    // Respond with true or false to Frontend, depending on Success
    if (response !== 401 || response !== 400) {
      // Success!
      res.send(response);
    } else {
      response === 400
        ? res.status(400).send("Invalid ID")
        : res.status(401).send("Wrong Password");
    }
  });
});

router.get("/:id", JWT.check, (req, res) => {
  // Send a User-Model to the FrontEnd, without critical Data like Password
  UserHandler.getFullUserById(req.params.id).then((response) => {
    res.send(response);
  });
});

router.post("/multi/medium", JWT.check, async (req, res) => {
  const ids = req.body.idsArray;

  let usersArray = [];
  let temp;

  for (let i = 0; i < ids.length; i++) {
    temp = await UserHandler.getMediumUserById(ids[i]);
    usersArray.push(temp);
  }

  if (usersArray.length > 0) {
    res.status(200).send(usersArray);
  } else {
    res.status(204).send("No Content");
  }
});

router.post("/multi/light", JWT.check, async (req, res) => {
  const ids = req.body.idsArray;

  let usersArray = [];
  let temp;

  for (let i = 0; i < ids.length; i++) {
    temp = await UserHandler.getSmallUserById(ids[i]);
    usersArray.push(temp);
  }

  if (usersArray.length > 0) {
    res.status(200).send(usersArray);
  } else {
    res.status(204).send("No Content");
  }
});

module.exports = router;
