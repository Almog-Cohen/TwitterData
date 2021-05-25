require("dotenv").config();

const axios = require("axios");
const token = `Bearer ${process.env.BEARER_TOKEN}`;
const options = {
  method: "GET",
  headers: {
    "Content-type": "application/json",
    Authorization: token,
  },
};
// Get list of users and request data from twitter api for each user
// Store the users data in psql database
const handleGetUsers = async (req, res, psqlDB) => {
  try {
    const users = req.body;

    const usersData = await axios.get(
      `https://api.twitter.com/1.1/users/lookup.json?screen_name=${users.screen_name}`,
      options
    );

    // // Can add a function that check if the user alredy exists in the database
    // // If the user exists do the same tasks just instead insert method i can use update method

    const initalDb = await insertTasksToDb(
      psqlDB,
      users.screen_name.split(",")
    );
    const isDataStore = await storeUserData(psqlDB, usersData.data);
    return res.json(usersData.data.map((userInfo) => userInfo.screen_name));
  } catch (error) {
    console.log(error);
    return res.json("Error in server");
  }
};

// Get whole users data and tweets and sotre in the database
// When the task completed for each user, when task is completed it stored in the database as completed
const storeUserData = async (psqlDB, usersData) => {
  const arrayOfPromises = await Promise.all(
    usersData.map(async (userInfo) => {
      // Sending requests by max_id to get the previus tweets to this id
      let tweetText = [];
      let max_id = "";
      let maxMessages = true;
      while (maxMessages) {
        const userTweets = await axios.get(
          `https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${
            userInfo.screen_name
          }&count=200&trim_user=1&include_rts=1&&${
            max_id ? `max_id=${max_id}` : ""
          }`,
          options
        );
        // If the the length of the tweets data is below 195 stop requesting more tweets
        if (userTweets.data.length < 195) maxMessages = false;
        // The max max_id is equal to the last tweet id in the array of tweets
        max_id = userTweets.data[userTweets.data.length - 1].id;
        // Can change it to array that start iterating from index 1 instead of 0 for not repating the max_id tweet after the first request
        tweetText.push(userTweets.data.map((tweet) => tweet.text + ""));
      }
      const commonWord = findMostCommonWord(tweetText);

      // Using transaction to chain database respones.
      // When user data stored in database then the task is completed and stored in the database(completed=true)
      return psqlDB
        .transaction((trx) => {
          trx
            .insert({
              name: userInfo.screen_name,
              followers: userInfo.followers_count,
              following: userInfo.friends_count,
              description: userInfo.description,
              profile_image: userInfo.profile_image_url_https,
              tweets: userInfo.statuses_count,
              most_common_word: commonWord,
            })
            .into("users")
            .returning("name")
            .then((username) => {
              return trx("tasks").where("name", "=", username[0]).update({
                status: true,
              });
            })
            .then(trx.commit)
            .catch(trx.rollback);
        })
        .catch((err) => console.log(err));
    })
  );

  return arrayOfPromises;
};
// Find most common repeated word and return it
const findMostCommonWord = (tweetText) => {
  // Can add more filters by words and regex

  let arrayOfWords = tweetText.join(" ").split(" ");
  // Algorithm to check maximun repated word
  let wordsMap = new Map();
  let maxNumberOfWords = 1;
  let mostCommonWord = arrayOfWords[0];
  arrayOfWords.map((word) => {
    if (wordsMap.has(word)) {
      wordsMap.set(word, wordsMap.get(word) + 1);
      if (wordsMap.get(word) > maxNumberOfWords) {
        maxNumberOfWords = wordsMap.get(word);
        mostCommonWord = word;
      }
    } else {
      wordsMap.set(word, 1);
    }
  });
  return mostCommonWord;
};

// Initailze tasks in database(uncompleted=false)
const insertTasksToDb = async (psqlDB, users) => {
  const arrayOfTasks = await Promise.all(
    users.map((user) => {
      return psqlDB("tasks").insert({
        name: user,
        status: false,
      });
    })
  );
  return arrayOfTasks;
};

module.exports = {
  handleGetUsers: handleGetUsers,
};
