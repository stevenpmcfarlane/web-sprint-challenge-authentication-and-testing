const router = require("express").Router();
const restricted = require("../middleware/restricted");
const bcryptjs = require("bcryptjs");
const Users = require("./users-model");

router.post("/register", (req, res) => {
  const credentials = req.body;
  if (!credentials.username || !credentials.password) {
    res.status(500).json({ message: "username and password required" });
  }
  const existing = Users.findByUsername(credentials.username);
  if (existing) {
    res.status(500).json({ message: "username taken" });
  }
  const rounds = process.env.BCRYPT_ROUNDS || 8;

  const hash = bcryptjs.hashSync(credentials.password, rounds);

  credentials.password = hash;

  Users.add(credentials)
    .then((userId) => {
      res.status(201).json({ id: userId, ...credentials });
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });

  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post("/login", restricted, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(500).json({ message: "username and password required" });
  }

  Users.findByUsername(username)
    .then(([user]) => {
      // compare the password the hash stored in the database
      if (user && bcryptjs.compareSync(password, user.password)) {
        const token = buildToken(user);
        res.status(200).json({ message: `welcome, ${user.username}`, token });
      } else {
        res.status(500).json({ message: "invalid credentials" });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });

  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

function buildToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const config = {
    expiresIn: "1d",
  };
  return jwt.sign(payload, jwtSecret, config);
}

module.exports = router;
