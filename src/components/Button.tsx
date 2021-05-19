
import * as React from "react";
import "./Button.css";
import {MessageType} from "../types";

export const Button = () => {
    const [myBool, flipBoolean] = React.useState(true);


  React.useEffect(() => {
    chrome.runtime.onMessage.addListener((message: MessageType) => {
      switch (message.type) {
        case "BOOL_STATUS":
          flipBoolean(message.bool);
          break;
        default:
          break;
      }
    });
  }, []);

    const onClick = () => {
        chrome.runtime.sendMessage({type: "TOGGLE_BOOL", bool: !myBool});
    }

    return (
        <div className="buttonContainer">
            <button className="boolButton" onClick={onClick}>
                {myBool ? "Falsehood is one click away" : "Truth is one click away"}
            </button>
        </div>
    );
};