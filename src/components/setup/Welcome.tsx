import * as React from "react";
import logo from "../../urbit.svg";
import {useHistory} from "react-router";

export default function Welcome() {
    const history = useHistory();
    return (
      <div className="welcome padding flex-grow-wrapper">
        <div className="flex-grow">
        <img src={logo} className="App-logo" />
        </div>
        <button onClick={() => history.push("/setup")} className="single-button add-ship-button">Setup</button>
      </div>
    );
  }
  