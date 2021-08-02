import * as React from "react";
import {useState} from "react";
import UrbitLogo from "./components/ui/svg/UrbitLogo";
import logo from "./urbit.svg";
import Sigil from "./components/ui/svg/Sigil"
import AddShipForm from "./components/adding/AddShipForm";
import ShipList from "./components/ShipList";
import {
    MemoryRouter as Router,
    Switch,
    Route,
    Link,
    useHistory
  } from "react-router-dom";


import "./App.css";

export default function App() {
    const [first, setFirst] = useState(true);
    const rootContent = first ? <AddShip/> : <Ships />

    return (
    <Router>
      <div className="App">
        <NavBar />
        <Switch>
          <div className="App-content">
          <Route exact path="/">
            {rootContent}
          </Route>
          <Route path="/add_ship">
             <AddShipForm />
          </Route>
          </div>
        </Switch>
      </div>
      </Router>
    );
  }
  
  function NavBar() {
    return (<nav className ="App-navbar">
      <h4>Login With Urbit</h4>
      <img src={logo} className="Nav-logo"/>
    </nav>);
}

function DoAddShip(){
    let history = useHistory();
    return (
        <div className="">
              <button onClick={()=> history.push("/")} className="add-ship-button">go back</button>
          </div>
        );
}

function AddShip() {
  let history = useHistory();
  return (
  <div className="">
        <img src={logo} className="App-logo"/>
        <button onClick={()=> history.push("/add_ship")} className="add-ship-button">Add your Ship</button>
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
