const express = require("express");
require("dotenv").config();
const cors = require("cors");
var Twitter = require("twitter");
const getUsers = require("./controllers/getUsers");
const getUserData = require("./controllers/getUserData");
const knex = require("knex");

const psqlDB = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "postgres",
    password: "postgres",
    database: "tests",
  },
});

const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());
app.use(cors());

let client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

app.get("/", (req, res) => res.send("Server is running"));
app.post("/get-users", (req, res) => {
  getUsers.handleGetUsers(req, res, client, psqlDB);
});
app.get("/get-specsific-user/:username", (req, res) => {
  getUserData.handleGetUserData(req, res, psqlDB);
});

app.listen(PORT, () => {
  console.log(`app is runing on port ${PORT}`);
});
