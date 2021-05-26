import { MessageType } from "./types";
import Urbit from "@urbit/http-api";

// Request Origin rewriting
chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    details.initiator
    if (details.initiator == 'chrome-extension://' + chrome.runtime.id) {
      if (details.requestHeaders) {
        for (var i = 0; i < details.requestHeaders.length; ++i) {
          if (details.requestHeaders[i].name === 'Origin') {
            details.requestHeaders[i] = {name: "Origin", value: "http://dcspark.io"}
          }
        }
      }
    }
    return {requestHeaders: details.requestHeaders};
  },
  {urls: ["<all_urls>"]},
  ["blocking", "requestHeaders", "extraHeaders"]
);


let airlock = Urbit.authenticate({
          ship: '~zod',
          url: 'localhost:8080',
          code: 'lidlut-tabwed-pillex-ridrup',
          verbose: true
}).catch(err => {
  console.log(err);
});

// airlock.then(urbit => {
//   console.log("Attempting to connect to urbit ship.");
//   console.log(urbit.ship);
//   // urbit.scry()
// });




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