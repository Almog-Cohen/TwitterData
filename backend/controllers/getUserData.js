// Get specific user data
const handleGetUserData = async (req, res, psqlDB) => {
  const { username } = req.params;
  try {
    const user = await psqlDB
      .select("*")
      .from("users")
      .where("name", "=", username);
    return res.json(user[0]);
  } catch (error) {
    console.log(error);
    return res.json("Error in the server");
  }
};

module.exports = {
  handleGetUserData: handleGetUserData,
};
