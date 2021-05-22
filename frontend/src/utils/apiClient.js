import axios from "axios";

// Get twitter users data
export async function getTwitterUsers(names) {
  const response = await axios.post("http://localhost:3001/get-users", {
    screen_name: names,
  });
  return response.data;
}

// Get specific user data
export async function getUserData(username) {
  const response = await axios.get(
    `http://localhost:3001/get-specsific-user/${username}`
  );
  return response.data;
}
