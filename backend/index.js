const express = require("express");
require("dotenv").config();
const cors = require("cors");
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

app.get("/", (req, res) => res.send("Server is running"));
// Get users data and store it in database
app.post("/get-users", (req, res) => {
  getUsers.handleGetUsers(req, res, psqlDB);
});
// Get specific user data from database
app.get("/get-specsific-user/:username", (req, res) => {
  getUserData.handleGetUserData(req, res, psqlDB);
});

app.listen(PORT, () => {
  console.log(`app is runing on port ${PORT}`);
});
