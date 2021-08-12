import Urbit from "@urbit/http-api";
import { EncryptedShipCredentials } from "./types/types";

import {getAll, getSelected} from "./storage"
import {fetchPerms, checkPerms, scry, thread, poke, subscribe} from "./urbit"

// opens extension in a full screen tab to use devtools properly, to delete in production
function openTab(filename : string) {
    const myid = chrome.i18n.getMessage("@@extension_id");
    console.log(myid, "myid")
    chrome.windows.getCurrent(function (win) {
        chrome.tabs.query({ 'windowId': win.id }, function (tabArray) {
            for (let i in tabArray) {
                if (tabArray[i].url == "chrome-extension://" + myid + "/" + filename) {
                    // console.log("already opened"); 
                    chrome.tabs.update(tabArray[i].id, { active: true }); return;
                }
            } chrome.tabs.create({ url: chrome.extension.getURL(filename) });
        });
    });
}
openTab("popup.html")

interface BackgroundController {
  locked: boolean
  activeShip: EncryptedShipCredentials,
  url: string,
}

const controller : BackgroundController = {
  locked: true,
  activeShip: null,
  url: null,
}


// sync permissions data from ship to browser storage

// background listener handles messages from the content script, fetches data from the extension, then sends back a response to the content script 
chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>{
  console.log(request, "background script receiving message from content script")
  console.log(sender.tab 
    ? "from a content script:" + sender.tab.url 
    : "from the extension");
  console.log(controller, "as of now controller is")
  // idea would be to open the extension and trigger something here
  if(controller.locked) sendResponse(false)
  fetchPerms(controller.url).then(res => console.log(res, "permissions!"))
  switch (request.type){
    // saves ship data to background state
    case "selected":
      controller.locked = false;
      controller.url = request.url;
      controller.activeShip = request.ship
      console.log(controller, "ship selected");
      sendResponse("ok")
      break;
    // 
    case "active":
      sendResponse(controller)
      break;
    case "unlock":
      console.log(controller, "background controller before unlock request");
      controller.url = request.data;
      controller.locked = false;
      console.log(controller, "background controller after unlock request");
      sendResponse(controller);
      break;
    case "lock": 
      controller.url = "";
      controller.locked = true;
      sendResponse(controller);
    case "all":
      getAll()
      .then(res => sendResponse({res: res}))
      .catch(err => sendResponse({err: err}))
      break;
    case "ship":
      sendResponse(controller.activeShip.shipName)
      break;
    case "scry":
        scry(controller.url, request.data)
        .then(res => sendResponse(res))
      break;
    case "poke":
      poke(controller.url, request.data)
      .then(res => sendResponse(res))
      break;
    case "thread":
      thread(controller.url, request.data)
        .then(res => sendResponse(res))
      break;
    case "subscribe":
      subscribe(controller.url, request.data)
      .then(res => sendResponse(res))
    break;
    default: break;
  }
  return true
});