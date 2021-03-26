const db = require("../../data/dbConfig.js");

function findByUsername(username) {
  return db("users")
    .select("id", "username", "password")
    .where("username", username)
    .first();
}

function add(user) {
  const { username, password } = user;
  return db("users").insert({ username, password });
}

module.exports = {
  findByUsername,
  add,
};
