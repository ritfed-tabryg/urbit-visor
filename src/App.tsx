import * as React from "react";
import { useState, useEffect } from "react";
import UrbitLogo from "./components/ui/svg/UrbitLogo";
import logo from "./urbit.svg";
import NavBar from "./components/ui/NavBar";
import Sigil from "./components/ui/svg/Sigil"
import AddShipForm from "./components/adding/AddShipForm";
import Dashboard from "./components/list/Dashboard";
import ShipList from "./components/ShipList";
import ShipShow from "./components/show/ShipShow";
import { getAll, saveSelection } from "./storage";
import { EncryptedShipCredentials } from "./types/types";
import {
  MemoryRouter as Router,
  Switch,
  Route,
  Link,
  useHistory
} from "react-router-dom";
declare const window: any;


import "./App.css";

export default function App() {
  function readStorage() {
    getAll()
      .then((res) => {
        setFirst(false);
        setShips(res.ships);
        setSelected(res.selected);
        setActive(res.selected);
      })
      .catch(err => console.log("err"))
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
  function saveShip(ship: EncryptedShipCredentials):void{
    saveSelection(ship);
    setActive(ship);
    setSelected(ship);
  };


  function deleteShip(shipName: string): void {
    console.log(shipName, "gonna go")
    chrome.storage.local.get(["ships"], (res) => {
      if (res["ships"].length) {
        const new_ships = res["ships"].filter((el: EncryptedShipCredentials) => el.shipName !== shipName);
        chrome.storage.local.set({ ships: new_ships })
        readStorage();
      }
    });

  }
  const [first, setFirst] = useState(true);
  const [ships, setShips] = useState([]);
  const [active, setActive] = useState(null);
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    readStorage();
  }, []);
  const root_component = first
    ? <Welcome />
    : selected
      ? <ShipShow save={saveShip} connected={active === selected} ship={selected} />
      : <Dashboard ships={ships} select={(ship) => setSelected(ship)} remove={deleteShip} />
  console.log(selected, "selected")
  return (
    <Router>
      <div className="App">
        <NavBar
          ships={ships}
          selected={selected}
          switchShip={(s: EncryptedShipCredentials) => setSelected(s)}
        />
        <div className="App-content">
          <Switch>
            <Route exact path="/">
              {root_component}
            </Route>
            <Route path="/add_ship">
              <AddShipForm store={storeCredentials} />
            </Route>
            <Route path="/dashboard">
              <Dashboard ships={ships} select={(ship) => setSelected(ship)} remove={deleteShip} />
            </Route>
            <Route path="/ship/">
              <ShipShow save={saveShip} connected={active === selected} ship={selected} />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
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
      <button onClick={() => history.push("/add_ship")} className="button add-ship-button">Add your Ship</button>
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
