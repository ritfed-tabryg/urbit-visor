import * as React from "react";
import { useState, useEffect } from "react";
import UrbitLogo from "./components/ui/svg/UrbitLogo";
import logo from "./urbit.svg";
import Sigil from "./components/ui/svg/Sigil"
import AddShipForm from "./components/adding/AddShipForm";
import Dashboard from "./components/list/Dashboard";
import ShipList from "./components/ShipList";
import ShipShow from "./components/show/ShipShow";
import { EncryptedShipCredentials } from "./types";
import {
  MemoryRouter as Router,
  Switch,
  Route,
  Link,
  useHistory
} from "react-router-dom";


import "./App.css";

export default function App() {
  function readStorage() {
    console.log('wtf')
    chrome.storage.local.get(["ships"], (res) => {
      if (res["ships"] && res["ships"].length) {
        console.log(res)
        setFirst(false)
      } else{
        setFirst(true)
      }
      setShips(res["ships"]);
      console.log(ships, "ships")

    });
    console.log(ships, "ships2")

  }

  function storeCredentials(encryptedCredentials: EncryptedShipCredentials): void {
    chrome.storage.local.get("ships", (res) => {
      if (res["ships"]) {
        let new_ships = res["ships"];
        new_ships.push(encryptedCredentials)
        chrome.storage.local.set({ ships: new_ships });
      } else {
        let new_ships = [encryptedCredentials];
        chrome.storage.local.set({ ships: new_ships });
      }
      readStorage();
    });
  }


  function deleteShip(shipName: string):void{
    console.log(shipName, "gonna go")
    chrome.storage.local.get(["ships"], (res) => {
        if (res["ships"].length) {
          console.log(res)
          const new_ships = res["ships"].filter((el: EncryptedShipCredentials) => el.shipName !== shipName);
          console.log(new_ships)
          chrome.storage.local.set({ships: new_ships})
          readStorage();
        }
      });

}
  const [first, setFirst] = useState(true);
  const [ships, setShips] = useState([]);
  const [selected, setSelected] = useState(null);
  useEffect(() => readStorage(), [])
  const root_component = first ? <Welcome /> : <Dashboard ships={ships} select={(ship)=> setSelected(ship)}remove={deleteShip}/>

  return (
    <Router>
      <div className="App">
        <NavBar />
        <Switch>
          <div className="App-content">
            <Route exact path="/">
              {root_component}
            </Route>
            <Route path="/add_ship">
              <AddShipForm store={storeCredentials}/>
            </Route>
            <Route path="/dashboard">
              <Dashboard ships={ships} select={(ship)=> setSelected(ship)} remove={deleteShip}/>
            </Route>
            <Route path="/ship/">
              <ShipShow ship={selected}/>
            </Route>
          </div>
        </Switch>
      </div>
    </Router>
  );
}

function NavBar() {
  return (<nav className="App-navbar">
    <Link to="/">
    <h4>Login With Urbit</h4>
    </Link>
    <img src={logo} className="Nav-logo" />
  </nav>);
}

function DoAddShip() {
  let history = useHistory();
  return (
    <div className="">
      <button onClick={() => history.push("/")} className="add-ship-button">go back</button>
    </div>
  );
}

function Welcome() {
  let history = useHistory();
  return (
    <div className="welcome">
      <img src={logo} className="App-logo" />
      <button onClick={() => history.push("/add_ship")} className="add-ship-button">Add your Ship</button>
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
