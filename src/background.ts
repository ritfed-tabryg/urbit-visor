import Urbit from "@urbit/http-api";
import { BackgroundState, UrbitVisorAction } from "./types/types";

import { getPreference, getSelected } from "./storage"
import { fetchAllPerms, scry, thread, poke, subscribe } from "./urbit"
import { Messaging } from "./messaging";


const state: BackgroundState = {
  locked: true,
  cached_url: "",
  popupPreference: "modal",
  requestedPerms: null,
  activeShip: null,
  url: null,
  permissions: {}
};

// load popup preferences on startup
function loadPreferences() {
  getPreference()
    .then(res => state.popupPreference = res)
    .catch(err => console.error(err))
}

loadPreferences();

// listen to changes in popup preference in storage

chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (changes.popup) loadPreferences();
});


function handleInternalMessage(request: any, sender: any, sendResponse: any) {
  switch (request.action) {
    case "state":
      sendResponse(state)
      break;
    case "connected":
      state.url = request.data.url;
      state.activeShip = request.data.ship;
      chrome.browserAction.setBadgeText({ text: "" });
      console.log(state, "ship selection saved to memory");
      if (request.data.url) state.locked = false;
      else state.locked = true;
      sendResponse(request.ship)
      break;
    case "cache_form_url":
      state.cached_url = request.data.url;
      break;
    case "dismiss_perms":
      chrome.browserAction.setBadgeText({ text: "" });
      state.requestedPerms = null;
      break;
  }
}

function handleVisorCall(request: any, sender: any, sendResponse: any) {
  console.log(request, 'handling visor call')
  if (state.locked) requirePerm("locked", sendResponse);
  else checkPerms(request, sender, sendResponse);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.app == "urbit-visor-internal") handleInternalMessage(request, sender, sendResponse);
  else if (request.app == "urbitVisor") handleVisorCall(request, sender, sendResponse);
  return true
});




function openWindow() {
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
    focused: true,
    height: 600,
    width: 357,
  });
}
type Lock = "locked" | "noperms";
function requirePerm(type: Lock, sendResponse: any) {
  if (state.popupPreference == "window") openWindow();
  else {
    chrome.browserAction.setBadgeText({ text: "1" });
    chrome.browserAction.setBadgeBackgroundColor({ color: "#FF0000" });
    sendResponse({status: type, response: null});
  }
}

function checkPerms(request: any, sender: any, sendResponse: any) {
    fetchAllPerms(state.url)
      .then(res => {
        console.log(res, "perms")
        const existingPerms = res.bucket[sender.origin];
        if (!existingPerms || !existingPerms.includes(request.action)) {
          state.requestedPerms = { website: sender.origin, permissions: [request.action], existing: existingPerms };
          requirePerm("noperms", sendResponse);
        } 
        else if (request.action === "perms") bulkRequest(existingPerms, request, sender, sendResponse)
        else respond(request, sender, sendResponse);
      })
};

function bulkRequest(existingPerms: any, request: any, sender: any, sendResponse: any) {
      if (existingPerms && request.data.every((el: UrbitVisorAction) => existingPerms.includes(el))) sendResponse("perms_exist")
      else {
        state.requestedPerms = { website: sender.origin, permissions: request.data, existing: existingPerms };
        requirePerm("noperms", sendResponse);
      }
}


function respond(request: any, sender: any, sendResponse: any): void {
  switch (request.action) {
    // visor endpoints
    case "perms":
      sendResponse({status: "ok", response: "perms_exist"});
      break;
    case "shipName":
      sendResponse({status: "ok", response: state.activeShip.shipName})
      break;
    case "shipURL":
      sendResponse({status: "ok", response: state.url})
      break;
    case "scry":
      scry(state.url, request.data)
        .then(res => sendResponse({status: "ok", response: res}))
        .catch(err => sendResponse({ error: err }))
      break;
    case "poke":
      const pokePayload = Object.assign(request.data, { onSuccess: handlePokeSuccess, onError: handleError });
      poke(state.activeShip.shipName, state.url, pokePayload)
        .then(res => sendResponse({status: "ok", response: res}))
        .catch(err => sendResponse({ error: err }))
      break;
    case "thread":
      thread(state.url, request.data)
        .then(res => sendResponse({status: "ok", response: res}))
        .catch(err => sendResponse({ error: err }))
      break;
    case "subscribe":
      const payload = Object.assign(request.data, { event: (event: any) => handleEvent(event, sender.tab.id), err: handleError })
      subscribe(state.activeShip.shipName, state.url, payload)
        .then(res => sendResponse({status: "ok", response: res}))
        .catch(err => sendResponse({ error: err }))
      break;
    default: break;
  }
}

function handlePokeSuccess() {
  window.postMessage({ app: "urbitVisor-sse", poke: "ok" }, window.origin)
}
function handleEvent(event: any, tab_id: number) {
  console.log(event, "event handled")
  chrome.tabs.sendMessage(tab_id, { app: "urbitVisor-sse", event: event })
}
function handleError(error: any) {
  window.postMessage({ app: "urbitVisor-sse", error: error }, window.origin)
}