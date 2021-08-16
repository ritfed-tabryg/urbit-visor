import Urbit from "@urbit/http-api";
import { EncryptedShipCredentials, BackgroundController, PermissionRequest } from "./types/types";

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



const controller : BackgroundController = {
  locked: true,
  perms: null,
  activeShip: null,
  url: null,
}
// browser.runtime.onMessage.addListener((request) => {
  
// })

// sync permissions data from ship to browser storage

// background listener handles messages from the content script, fetches data from the extension, then sends back a response to the content script 
chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>{
  console.log(request, "request")
  // console.log(request, "background script receiving message from content script")
  // console.log(sender, "sender")
  // console.log(sender.tab 
  //   ? "from a content script:" + sender.tab.url 
  //   : "from the extension");
  // console.log(controller, "as of now controller is")
  // // idea would be to open the extension and trigger something here
  if (request.open) {
      chrome.browserAction.getPopup({}, (popup) => {
        sendResponse(popup)
      })
  }
  const needPerms = ["ship", "scry", "thread", "poke", "subscribe"];
  if (needPerms.includes(request.type)) firewall(request, sender, sendResponse);
  else respond(request, sender, sendResponse);
  return true
});

function firewall(request: any, sender: any, sendResponse: any){
  console.log(request, "firewall")
  if(controller.locked){
    console.log('extension is locked')
    // window.postMessage({ app: "openModal" }, window.origin)
    // chrome.tabs.create({url : "popup.html"})
    // window.open("chrome-extension://apddmnnkhembaaebippnckmnhbgifcfl/popup.html");
    // chrome.runtime.sendMessage({type: "locked"});
    controller.locked = true;
    sendResponse("locked")
  }else {
    fetchPerms(controller.url).then(res => {
      console.log(res, "permissions!");
      const perms = res.bucket[sender.origin];
      if (!perms){
        controller.perms = {website: sender.origin, permissions: [request.type]};
        // chrome.runtime.sendMessage({type: "noperms", perms: [request.type], site: sender.origin});
        sendResponse("noperms");
      } else{
        if (request.type in perms){
          respond(request, sender, sendResponse);
        } else{
          controller.perms = {website: sender.origin, permissions: [request.type]};
          // chrome.runtime.sendMessage({type: "noperms", perms: [request.type], site: sender.origin});
          sendResponse("noperms")
        }
      }
    });
  }
};

function respond(request: any, sender: any, sendResponse: any) : void{
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
        console.log("sneaked here somehow")
        scry(controller.url, request.data)
        .then(res => sendResponse(res))
      break;
    case "poke":
      poke(controller.activeShip.shipName, controller.url, request.data)
      .then(res => sendResponse(res))
      break;
    case "thread":
      thread(controller.url, request.data)
        .then(res => sendResponse(res))
      break;
    case "subscribe":
      subscribe(controller.activeShip.shipName, controller.url, request.data)
      .then(res => sendResponse(res))
    break;
    default: break;
  }
}