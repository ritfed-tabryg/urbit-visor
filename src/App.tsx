import * as React from "react";
import logo from "./urbit.svg";
import "./App.css";
import { Button } from "./components/Button";

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Login With Urbit
        </p>
        <Button />
      </header>
    </div>
  );
};

export default App;