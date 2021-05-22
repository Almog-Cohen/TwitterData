import React from "react";
import Button from "@material-ui/core/Button";
import { useHistory } from "react-router-dom";
import Typography from "@material-ui/core/Typography";

const UserProfile = ({ username }) => {
  const history = useHistory();

  // Move to the home page
  const handleClick = (e) => {
    e.preventDefault();
    history.push("home-page");
  };

  return (
    <div>
      <img
        style={{ width: "100px", height: "100px" }}
        src={username.profile_image}
      />
      <Typography variant="h3" component="h2" gutterBottom>
        Username: {username.name}
      </Typography>
      <Typography variant="h7" component="h2" gutterBottom>
        Followers: {username.followers}
      </Typography>
      <Typography variant="h7" component="h2" gutterBottom>
        Following: {username.following}
      </Typography>
      <Typography variant="h7" component="h2" gutterBottom>
        Most common word: {username.most_common_word}
      </Typography>
      <Typography variant="h7" component="h2" gutterBottom>
        Description: {username.description}
      </Typography>
      <Typography variant="h7" component="h2" gutterBottom>
        Tweets: {username.tweets}
      </Typography>
      <Button
        onClick={handleClick}
        color="primary"
        variant="contained"
        disabled={false}
      >
        Home Page
      </Button>
    </div>
  );
};

export default UserProfile;
