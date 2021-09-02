import * as React from "react";
import { useState, useEffect } from "react";
import UrbitLogo from "./components/ui/svg/UrbitLogo";
import logo from "./urbit.svg";
import NavBar from "./components/ui/NavBar";
import Welcome from "./components/setup/Welcome";
import Setup from "./components/setup/Setup";
import AddShip from "./components/adding/AddShip"
import ShipList from "./components/list/ShipList";
import ShipShow from "./components/show/ShipShow";
import Permissions from "./components/perms/Permissions";
import PermissionsPrompt from "./components/perms/PermissionsPrompt";
import Settings from "./components/settings/Settings";
import About from "./components/ui/About";
import { decrypt, getStorage, storeCredentials, initStorage } from "./storage";
import { EncryptedShipCredentials, BackgroundState, PermissionRequest } from "./types/types";
import { fetchAllPerms, grantPerms } from "./urbit";
import { Messaging } from "./messaging";
import {
  MemoryRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory
} from "react-router-dom";
import { LocationDescriptor } from "history";

import "./App.css";

export default function App() {
  const history = useHistory();
  const [first, setFirst] = useState(true);
  const [ships, setShips] = useState([]);
  const [active, setActive] = useState(null);
  const [selected, setSelected] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [perms, setPerms] = useState(null);
  const [shipURL, setShipURL] = useState(null);
  const [cachedURL, setCachedURL] = useState("http://localhost")

  chrome.storage.onChanged.addListener(function (changes, namespace) {
    // TODO automatically wipe active ship if deleted
    // stay in settings if individual settings changed
    if (changes.popup || changes.password && !changes.ships) return
    else setState();
  });



  async function readStorage() {
    return await getStorage(["ships", "password"])
  }
  async function readState(): Promise<any> {
    return Messaging.sendToBackground({app: "urbit-visor-internal", action: "state"});
  };

  async function setState() {
    const storage = await readStorage();
    console.log(storage, "storage read")
    const state = await readState();
    console.log(state, "state read")
    const f = !("password" in storage);
    setFirst(f);
    const s = storage.ships || []
    setShips(s);
    if (state.cached_url?.length > 0) setCachedURL(state.cached_url)
    if (state.activeShip) {
      setSelected(state.activeShip);
      setActive(state.activeShip);
    } else{
      setSelected(null)
      setActive(null)
    };
    route(f, s, state)
  }

  function redirect(): LocationDescriptor {
    if (first) return "/welcome"
    else if (active) return "/ship"
    else if (ships) return "/ship_list"
    else return "/add_ship"
  }


  function route(first: boolean, ships: EncryptedShipCredentials[], state: BackgroundState) {
    if (first) history.push("/welcome");
    else if (state.cached_url?.length > 0) history.push("/add_ship")
    else if (state.locked) {
      setPrompt("No Ship Connected");
      history.push("/ship_list");
    }
    else if (state.requestedPerms) {
      setPerms(state.requestedPerms);
      history.push("/ask_perms");
    }
    else if (state.activeShip) history.push("/ship");
    else if (ships) history.push("/ship_list");
    else history.push("/add_ship");
  }

  function showShip(ship: EncryptedShipCredentials) {
    setSelected(ship);
  }

  async function saveShip(ship: string, url: string, code: string, pw: string) {
    const creds = await storeCredentials(ship, url, code, pw);
    setSelected(creds);
    const storage = await readStorage();
    setShips(storage.ships);
    route(first, storage.ships, creds);
  }


  function saveActive(ship: EncryptedShipCredentials, url: string): void {
    // first move out of ship show to prevent crashes when activeShip is set to null
    if (ship == null) {
      setPrompt("No ship connected");
      history.push("/ship_list");
    }
    // send message to background script to keep the url in memory
    Messaging.sendToBackground({app: "urbit-visor-internal", action: "connected", data: {ship: ship, url: url}})
      .then(res =>{ 
         setPrompt("");
         setState();
      });
  };

  async function savePerms(pw: string, perms: PermissionRequest): Promise<any> {
    const url = decrypt(active.encryptedShipURL, pw);
    return grantPerms(active.shipName, url, perms)
  }

  async function setThemPerms(shipURL: string) {
    const perms = await fetchAllPerms(shipURL);
    setPerms(perms.bucket);
    setShipURL(shipURL);
    history.push("/perms")
  }
  useEffect(() => {
    setState();
  }, []);
  return (
    <div className="App">
      <NavBar
        ships={ships}
        selected={selected}
        active={active}
        switchShip={(s: EncryptedShipCredentials) => showShip(s)}
      />
      <div className="App-content">
        <Switch>
          <Route exact path="/">
            <Redirect to={redirect()} />
          </Route>
          <Route path="/welcome">
            <Welcome />
          </Route>
          <Route path="/setup">
            <Setup setFirst={setFirst} />
          </Route>
          <Route path="/add_ship">
            <AddShip add={saveShip} cachedURL={cachedURL}/>
          </Route>
          <Route path="/ship_list">
            <ShipList active={active} message={prompt} ships={ships} select={(ship) => setSelected(ship)} />
          </Route>
          <Route path="/ship">
            <ShipShow save={saveActive} active={active} ship={selected} setThemPerms={setThemPerms} />
          </Route>
          <Route path="/perms">
            <Permissions setThemPerms={setThemPerms} shipURL={shipURL} ship={selected} perms={perms} />
          </Route>
          <Route path="/ask_perms">
            <PermissionsPrompt perms={perms} savePerms={savePerms} />
          </Route>
          <Route path="/settings">
            <Settings ships={ships}/>
          </Route>
          <Route path="/about">
            <About />
          </Route>
        </Switch>
      </div>
    </div>
  );
}

