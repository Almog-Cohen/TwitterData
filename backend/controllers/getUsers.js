// Get list of users and request data from twitter api for each user
// Store the users data in psql database
const handleGetUsers = async (req, res, client, psqlDB) => {
  try {
    console.log(req.body);
    const users = req.body;
    const usersData = await client.get("users/lookup", users);

    const initalDb = await insertTasksToDb(
      psqlDB,
      users.screen_name.split(",")
    );

    const isDataStore = await storeUserData(client, psqlDB, usersData);
    return res.json(usersData.map((userInfo) => userInfo.screen_name));
  } catch (error) {
    console.log(error);
    return res.json("Error in server");
  }
};

// Get users data and tweets and sotre in the database
// When the task completed for each user it it store in the database that the task is completed
const storeUserData = async (client, psqlDB, usersData) => {
  const arrayOfPromises = await Promise.all(
    usersData.map(async (userInfo) => {
      // Get user tweets (trim_user for reducing the object data)
      const userTweets = await client.get("statuses/user_timeline", {
        screen_name: userInfo.screen_name,
        trim_user: 1,
      });

      const tweetsText = userTweets.map((tweet) => tweet.text) + "";
      const commonWord = findMostCommonWord(tweetsText);

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
const findMostCommonWord = (tweetsText) => {
  // Can add more filters by words and regex
  let arrayOfWords = tweetsText.split(" ");

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
