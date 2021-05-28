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
      <div className="App App-background">
        <Switch>
          <Route path="/ship-added">
            <ShipAdded />
          </Route>
          <Route path="/">
            <AddShip />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function AddShip() {
  return (
    <div className="">
        <img src={logo} className="App-logo" alt="logo" />
        <h4>
          Login With Urbit
        </h4>
        <LoginForm />
    </div>
  );
}

function ShipAdded() {
  return (
    <div className="App App-background">
        <img src={logo} className="App-logo" alt="logo" />
        <h4>
          Ship Added Successfully
        </h4>
    </div>
    );
}
