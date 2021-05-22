import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import HomePage from "./components/HomePage/HomePage";
import UserProfile from "./components/UserProfile/UserProfile";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  console.log(username);

  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/home-page">
            <HomePage setUsername={setUsername} />
          </Route>
          <Route path="/user-profile">
            <UserProfile username={username} />
          </Route>
          <Route path="/">
            <Redirect to="/home-page" />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
