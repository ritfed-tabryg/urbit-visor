import * as React from "react";
import logo from "./urbit.svg";
import "./App.css";
import LoginForm from "./components/LoginForm";
import ShipList from "./components/ShipList";
import {
  MemoryRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

export default function App() {
  return (
    <div className="App">

      <Router>
        <div className="App-content">
          <Switch>
            <Route path="/ships">
              <Ships />
            </Route>
            <Route path="/ship-added">
              <ShipAdded />
            </Route>
            <Route path="/">
              <Ships />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}

function NavBar() {
      return (<nav className ="App-navbar">
        <h4>Login With Urbit</h4>
        <img src={logo} className="Nav-logo"/>
      </nav>);
}

function AddShip() {
  return (
    <div className="">
        <img src={logo} className="App-logo"/>
        <h4>
          Login With Urbit
        </h4>
        <LoginForm />
    </div>
  );
}

function ShipAdded() {
  return (
    <div className="">
        <img src={logo} className="App-logo" alt="logo" />
        <h4>
          Ship Added Successfully
        </h4>
    </div>
    );
}

function Ships() {
  return (
    <div className="ships">
        <img src={logo} className="App-logo" alt="logo" />
        <h4>
          Ships
        </h4>
        <ShipList />
    </div>
    );
}
