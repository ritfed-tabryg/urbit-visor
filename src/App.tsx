import * as React from "react";
import logo from "./urbit.svg";
import "./App.css";
import LoginForm from "./components/LoginForm";
import {
  MemoryRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

export default function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/account-added">
            <AccountAdded />
          </Route>
          <Route path="/">
            <AddAccount />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function AddAccount() {
  return (
    <div className="App App-background">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Login With Urbit
        </p>
        <LoginForm />
    </div>
  );
}

function AccountAdded() {
  return (
    <div className="App App-background">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Account Added Successfully
        </p>
    </div>
    );
}
