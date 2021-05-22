import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import { getTwitterUsers, getUserData } from "../../utils/apiClient";
import { useHistory } from "react-router-dom";
import "./HomePage.css";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import InputBase from "@material-ui/core/InputBase";
import { fade, makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 50,
    flexGrow: 1,
    maxWidth: 350,
    marginLeft: "auto",
    marginRight: "auto",
  },
  root1: {
    width: "100%",
    justifyContent: "center",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },

  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

const HomePage = ({ setUsername }) => {
  const classes = useStyles();
  const history = useHistory();
  const [listOfNames, setListOfNames] = useState("");
  const [fetchedUsers, setFetchedUsers] = useState("");
  const [error, setErorr] = useState("");
  console.log(listOfNames);

  // Send request to the server to search for twitter users
  const handleSubmit = async () => {
    error && setErorr("");
    const usersName = await getTwitterUsers(listOfNames);
    usersName === "Error in server"
      ? setErorr("Error in the server")
      : setFetchedUsers(usersName);
  };

  // Get user data and move to the user profile page
  const handleClick = async (e, user) => {
    e.preventDefault();
    const userData = await getUserData(user);
    if (userData === "Error in server") {
      setErorr("Error in the server");
    } else {
      setUsername(userData);
      history.push("/user-profile");
    }
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search twitter users…"
              value={listOfNames}
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              onChange={(e) => setListOfNames(e.target.value)}
            />
          </div>
        </Toolbar>
      </AppBar>

      <Button
        style={{ marginTop: "10px", marginBottom: "10px" }}
        onClick={(e) => (listOfNames ? handleSubmit() : e.preventDefault())}
        color="primary"
        variant="contained"
        disabled={false}
      >
        Search users
      </Button>
      {error && <p>{error}</p>}
      {fetchedUsers && (
        <div className={classes.root1}>
          {fetchedUsers.map((user) => (
            <div>
              <ListItem key={user} button>
                <ListItemText
                  onClick={(e) => handleClick(e, user)}
                  primary={user}
                />
              </ListItem>
              <Divider />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
