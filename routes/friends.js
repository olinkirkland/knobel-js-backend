const express = require('express');
const router = express.Router();

const JWT = require('../controllers/JWT');
const friendsHandler = require('../controllers/friendsHandler');

//! JWT.CHECK!!!
router.post(
  '/request',
  /* JWT.check, */ (req, res) => {
    const requestGiver = req.body.requestGiver;
    const requestTarget = req.body.requestTarget;

    friendsHandler
      .createRequest(requestGiver, requestTarget)
      .then((response) => {
        if (response === 512 || response === 400) {
          res
            .status(response)
            .send(response === 512 ? 'DB Query Failed' : 'Invaild ID');
        } else {
          res.status(201).send(`Created new Request to ${requestTarget}`);
        }
      });
  }
);

router.post('/accept', JWT.check, (req, res) => {
  const requestGiver = req.body.requestGiver;
  const requestTarget = req.body.requestTarget;

  friendsHandler.acceptRequest(requestGiver, requestTarget).then((response) => {
    if (response === 512 || response === 400) {
      res
        .status(response)
        .send(response === 512 ? 'DB Query Failed' : 'Invaild ID');
    } else {
      res.status(201).send(`Accepted Request from ${requestGiver}`);
    }
  });
});

router.post(
  '/decline',
  /* JWT.check, */ (req, res) => {
    const requestGiver = req.body.requestGiver;
    const requestTarget = req.body.requestTarget;

    friendsHandler
      .declineRequest(requestGiver, requestTarget)
      .then((response) => {
        if (response === 512 || response === 400) {
          res
            .status(response)
            .send(response === 512 ? 'DB Query Failed' : 'Invaild ID');
        } else {
          res.status(201).send(`Declined Request from ${requestGiver}`);
        }
      });
  }
);

module.exports = router;
