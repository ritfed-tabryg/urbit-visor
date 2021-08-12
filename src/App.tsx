import * as React from "react";
import { useState, useEffect } from "react";
import UrbitLogo from "./components/ui/svg/UrbitLogo";
import logo from "./urbit.svg";
import NavBar from "./components/ui/NavBar";
import Sigil from "./components/ui/svg/Sigil"
import AddShip from "./components/adding/AddShip"
import ShipList from "./components/list/ShipList";
import ShipShow from "./components/show/ShipShow";
import { getStorage, getAll, storeCredentials, savePassword, saveSelection } from "./storage";
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
  const history = useHistory();
  const [locked, setLocked] = useState(false); 
  const [first, setFirst] = useState(true);
  const [ships, setShips] = useState([]);
  const [active, setActive] = useState(null);
  const [selected, setSelected] = useState(null);

  chrome.storage.onChanged.addListener(function (changes, namespace) {
    readStorage();
  });
  function readStorage() {
    console.log("reading!")
    getStorage(["password", "ships"])
    .then(res => {
      setFirst(!("password" in res));
      setShips(res.ships || []);
    })
    chrome.runtime.sendMessage({type: "active"}, res => {
      console.log(res, "popup just fetched shit from background")
      if(res){
        setSelected(res.activeShip)
        setActive(res.activeShip)
      }
    })
  };
  function route(){
    const route = 
    first 
    ?  <Welcome />
    : selected 
    ? <ShipShow save={saveShip} active={active} ship={selected} remove={deleteShip} />
    : <ShipList ships={ships} select={(ship) => setSelected(ship)}/> 
    return route
  }


  function saveShip(ship: EncryptedShipCredentials, url: string):void{
    // send message to background script to keep the url in memory
    chrome.runtime.sendMessage({type: "selected", ship: ship, url: url}, (res) => console.log(res));
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
  useEffect(() => {
    readStorage();
  }, []);
  const root_component = route();
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
            <Route path="/setup">
              <Setup />
            </Route>       
            <Route path="/add_ship">
              <AddShip />
            </Route>
            <Route path="/dashboard">
              <ShipList ships={ships} select={(ship) => setSelected(ship)}/>
            </Route>
            <Route path="/ship">
              <ShipShow save={saveShip} active={active} ship={selected} remove={deleteShip} />
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
  const history = useHistory();
  return (
    <div className="welcome">
      <img src={logo} className="App-logo" />
      <button onClick={() => history.push("/setup")} className="button add-ship-button">Setup</button>
    </div>
  );
}

function Setup(){
   const history = useHistory();
   const [pw, setpw] = useState("");
   const [confirmationpw, setconfirmation] = useState("");
   const [error, setError] = useState("");
   function validate(){
     if (pw === confirmationpw){
       setError("");
       savePassword(pw)
       .then(res => history.push("/"))
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
