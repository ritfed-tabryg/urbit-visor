import { MessageType } from "./types";
import Urbit from "@urbit/http-api";




const sendBoolStatus = (bool: boolean) => {
    chrome.runtime.sendMessage({ type: "BOOL_STATUS", bool});
}

let bool = false;

// Get locally stored value
chrome.storage.local.get("bool", (res) => {
  if (res["bool"]) {
    bool = true;
  } else {
    bool = false;
  }
});

chrome.runtime.onMessage.addListener((message: MessageType) => {
  switch (message.type) {
    case "REQ_BOOL_STATUS":
      sendBoolStatus(bool);
      break;
    case "TOGGLE_BOOL":
      bool = message.bool;
      chrome.storage.local.set({ bool: bool });
      console.log("Local store saved bool value: ", bool);
      sendBoolStatus(bool);
      break;
    default:
      break;
  }
});