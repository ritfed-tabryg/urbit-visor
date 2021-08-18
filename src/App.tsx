import * as React from "react";
import { useState, useEffect } from "react";
import UrbitLogo from "./components/ui/svg/UrbitLogo";
import logo from "./urbit.svg";
import NavBar from "./components/ui/NavBar";
import Sigil from "./components/ui/svg/Sigil"
import AddShip from "./components/adding/AddShip"
import ShipList from "./components/list/ShipList";
import ShipShow from "./components/show/ShipShow";
import Permissions from "./components/perms/Permissions";
import PermissionsPrompt from "./components/perms/PermissionsPrompt";
import { decrypt, getStorage, storeCredentials, savePassword } from "./storage";
import { EncryptedShipCredentials, BackgroundController, PermissionRequest } from "./types/types";
import {fetchAllPerms, grantPerms} from "./urbit";
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

  chrome.storage.onChanged.addListener(function (changes, namespace) {
    // TODO use this instead of dispatching setFirst() around
    // readStorage();
  });


  async function readStorage(){
    return await getStorage(["ships", "password"])
  }
  async function readState(): Promise<any>{
    return new Promise((res, rej) => {
      chrome.runtime.sendMessage({type: "active"}, state => {
       res(state)
      })
    })
  };

  async function setState(){
    const storage = await readStorage();
    const state = await readState();
    const f = !("password" in storage);
    setFirst(f);
    const s = storage.ships || []
    setShips(s);
    if (state.activeShip){
      setSelected(state.activeShip);
      setActive(state.activeShip);
    };
    route(f, s, state)
  }

  function redirect(): LocationDescriptor{
    if (first) return "/welcome"
    else if (active) return "/ship"
    else if (ships) return "/dashboard"
    else return "/add_ship"
  }


  function route(first: boolean, ships: EncryptedShipCredentials[], state: BackgroundController){
    if (first) history.push("/welcome");
    else if (state.locked){ 
      setPrompt("No ship connected");
      history.push("/dashboard");
    }
    else if (state.requestedPerms) {
      setPerms(state.requestedPerms);
      history.push("/ask_perms");
    }
    else if (state.activeShip) history.push("/ship");
    else if (ships) history.push("/dashboard");
    else history.push("/add_ship");
  }

  function showShip(ship: EncryptedShipCredentials){
    setSelected(ship);
  }

  async function saveShip(ship: string, url: string, code: string, pw: string){
    const creds = await storeCredentials(ship, url, code, pw);
    setSelected(creds);
    const storage = await readStorage();
    setShips(storage.ships);
    route(first, storage.ships, creds);
  }


  function saveActive(ship: EncryptedShipCredentials, url: string):void{
    if (ship == null) history.push("/dashboard");
    else history.push("/ship")
    // send message to background script to keep the url in memory
    chrome.runtime.sendMessage({type: "selected", ship: ship, url: url}, (res) => console.log("ok"));
    setActive(ship);
    setSelected(ship);
    setState();
  };


  function deleteShip(shipName: string): void {
    chrome.storage.local.get(["ships"], (res) => {
      if (res["ships"].length) {
        const new_ships = res["ships"].filter((el: EncryptedShipCredentials) => el.shipName !== shipName);
        chrome.storage.local.set({ ships: new_ships })
        history.push("/dashboard");
        setState();
      }
    });
  }

  function savePerms(pw: string, perms: PermissionRequest): void{
    const url = decrypt(active.encryptedShipURL, pw);
    grantPerms(active.shipName, url, perms)
  }

  async function setThemPerms(url: string){
    const perms = await fetchAllPerms(url);
    setPerms(perms.bucket);
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
              <Setup setFirst={setFirst}/>
            </Route>       
            <Route path="/add_ship">
              <AddShip add={saveShip}/>
            </Route>
            <Route path="/dashboard">
              <ShipList setFirst={setFirst} active={active} message={prompt} ships={ships} select={(ship) => setSelected(ship)}/>
            </Route>
            <Route path="/ship">
              <ShipShow save={saveActive} active={active} ship={selected} remove={deleteShip} setThemPerms={setThemPerms}/>
            </Route>
            <Route path="/perms">
              <Permissions ship={selected} perms={perms}/>
            </Route>
            <Route path="/ask_perms">
              <PermissionsPrompt perms={perms} savePerms={savePerms}/>
            </Route>
          </Switch>
        </div>
      </div>
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
  const history = useHistory();
  return (
    <div className="welcome">
      <img src={logo} className="App-logo" />
      <button onClick={() => history.push("/setup")} className="button add-ship-button">Setup</button>
    </div>
  );
}
interface SetupProps {
  setFirst: (b: boolean) => void
}
function Setup({setFirst} : SetupProps){
   const history = useHistory();
   const [pw, setpw] = useState("");
   const [confirmationpw, setconfirmation] = useState("");
   const [error, setError] = useState("");
   function validate(){
     if (pw === confirmationpw){
       setError("");
       savePassword(pw)
       .then(res => {
         setFirst(false)
         history.push("/");
        })
     } else{
       setError("Passwords do not match")
     }
   }
  return (
    <div className="setup">
      <p>Please set up a master password for this extension.</p>
      <p>The password will be used to encrypt the credentials to access your Urbit ships.</p>
      <div className="form">
      <label>Password<input onChange={(e)=> setpw(e.currentTarget.value)} type="password" /></label>
      <label>Confirm password<input onChange={(e)=> setconfirmation(e.currentTarget.value)} type="password" /></label>
      <p className="errorMessage">{error}</p>
      <button onClick={validate} className="button">Submit</button>
      </div>
    </div>
  );
}
function Welcome2() {
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

// function Ships() {
//   return (
//     <div className="ships">
//       <img src={logo} className="App-logo" alt="logo" />
//       <h4>
//         Ships
//       </h4>
//       <ShipList />
//     </div>
//   );
// }
