//* Original Code from https://github.com/manishsaraan/email-validator/blob/master/index.js
async function checkEmail(req, res, next) {
  var tester =
    /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

  if (!req.body.newEmail) {
    const email = req.body.email;

    if (!email || typeof email === 'number') {
      res.status(401).send('Email is invalid!');
      return;
    }

    var emailParts = email.split('@');

    if (emailParts.length !== 2) {
      res.status(401).send('Email is invalid!');
      return;
    }

    var account = emailParts[0];
    var address = emailParts[1];

    if (account.length > 64) {
      res.status(401).send('Email is invalid!');
      return;
    } else if (address.length > 255) {
      res.status(401).send('Email is invalid!');
      return;
    }

    var domainParts = address.split('.');
    if (
      domainParts.some(function (part) {
        return part.length > 63;
      })
    ) {
      res.status(401).send('Email is invalid!');
      return;
    }

    if (!tester.test(email)) {
      res.status(401).send('Email is invalid!');
      return;
    }

    next();
  } else {
    const email = req.body.newEmail;

    if (!email || typeof email === 'number') {
      res.status(401).send('Email is invalid!');
      return;
    }

    var emailParts = email.split('@');

    if (emailParts.length !== 2) {
      res.status(401).send('Email is invalid!');
      return;
    }

    var account = emailParts[0];
    var address = emailParts[1];

    if (account.length > 64) {
      res.status(401).send('Email is invalid!');
      return;
    } else if (address.length > 255) {
      res.status(401).send('Email is invalid!');
      return;
    }

    var domainParts = address.split('.');
    if (
      domainParts.some(function (part) {
        return part.length > 63;
      })
    ) {
      res.status(401).send('Email is invalid!');
      return;
    }

    if (!tester.test(email)) {
      res.status(401).send('Email is invalid!');
      return;
    }

    next();
  }
}

module.exports = { checkEmail };
