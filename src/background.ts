import { EncryptedShipCredentials, UrbitVisorAction, UrbitVisorInternalAction, UrbitVisorInternalComms, UrbitVisorState } from "./types/types";

import { fetchAllPerms, scry, thread, poke, subscribe } from "./urbit"
import { useStore } from "./store";

async function init() {
  const state = useStore.getState();
  console.log(state, "state1")
  await state.init();
  console.log(useStore.getState(), "state2")
  // listen to changes in popup preference in storage
  storageListener();
  messageListener();
};
init();

function storageListener() {
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    const state = useStore.getState();
    console.log(state, "storage reacting to state")
    if (changes.popup) state.changePopupPreference(changes.popup.newValue);
    if (changes.permissions) state.loadPerms(changes.permissions.newValue);
    if (changes.ships) {
      if (state.activeShip && deletedWasActive(state.activeShip, changes.ships.newValue, changes.ships.oldValue)) {
        state.disconnectShip();
      }
      state.init().then(res => console.log(state))
    }
  });
}

function deletedWasActive(activeShip: EncryptedShipCredentials, newShips: EncryptedShipCredentials[], oldShips: EncryptedShipCredentials[]) {
  console.log(activeShip, "activeShip")
  console.log(newShips, "newships")
  console.log(oldShips, "oldships")
  if (newShips.length < oldShips.length) {
    const deletedShip = oldShips.find(ship => !newShips.map(newships => newships.shipName).includes(ship.shipName));
    if (activeShip.shipName == deletedShip.shipName) return true
    else return false
  }
  else return false
}

function messageListener() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.app == "urbit-visor-internal") handleInternalMessage(request, sender, sendResponse);
    else if (request.app == "urbitVisor") handleVisorCall(request, sender, sendResponse);
    return true
  });
}

function handleInternalMessage(request: UrbitVisorInternalComms, sender: any, sendResponse: any) {
  const state = useStore.getState();
  switch (request.action) {
    case "get_initial_state":
      sendResponse({ first: state.first, ships: state.ships, activeShip: state.activeShip, cachedURL: state.cached_url, requestedPerms: state.requestedPerms })
      break;
    case "get_ships":
      sendResponse({ ships: state.ships })
      break;
    case "get_selected":
      sendResponse({ selected: state.selectedShip, active: state.activeShip })
      break;
    case "get_cached_url":
      sendResponse({ cached_url: state.cached_url })
      break;
    case "get_perms":
      sendResponse({ selectedShip: state.selectedShip })
      break;
    case "get_settings":
      sendResponse({ popupPreference: state.popupPreference })
      break;
    case "set_master_password":
      state.setMasterPassword(request.data.password)
        .then(res => sendResponse("ok"));
      break;
    case "add_ship":
      state.addShip(request.data.ship, request.data.url, request.data.code, request.data.pw)
        .then(res => sendResponse("ok"));
      break;
    case "remove_ship":
      state.removeShip(request.data.ship)
        .then(res => sendResponse("ok"))
      break;
    case "select_ship":
      state.selectShip(request.data.ship);
      sendResponse("ok");
      break;
    case "connect_ship":
      state.connectShip(request.data.url, request.data.ship)
        .then(res => {
          chrome.browserAction.setBadgeText({ text: "" });
          sendResponse("ok")
        });
      break;
    case "disconnect_ship":
      state.disconnectShip();
      sendResponse("ok");
      break;
    case "grant_perms":
      state.grantPerms(request.data.request)
        .then(res => {
          chrome.browserAction.setBadgeText({ text: "" });
          sendResponse("ok")
        })
      break;
    case "deny_perms":
      state.denyPerms();
      chrome.browserAction.setBadgeText({ text: "" });
      sendResponse("ok");
      break;
    case "remove_whole_domain":
      break;
    case "revoke_perms":
      break;
    case "fetch_perms":
      break;
    case "change_popup_preference":
      state.changePopupPreference(request.data.preference)
        .then(res => sendResponse("ok"));
      break;
    case "change_master_password":
      state.changeMasterPassword(request.data.oldPw, request.data.newPw)
        .then(res => sendResponse("ok"))    
      break;
    case "reset_app":
      state.resetApp()
        .then(res => sendResponse("ok"))
      break;
    case "connect_to_ship":
      state.connectShip(request.data.url, request.data.ship)
        .then(res => {
          chrome.browserAction.setBadgeText({ text: "" });
          sendResponse("ok")
        })
      break;
    case "cache_form_url":
      state.cacheURL(request.data.url);
      break;
  }
}

function handleVisorCall(request: any, sender: any, sendResponse: any) {
  const state = useStore.getState();
  if (!state.activeShip) requirePerm(state, "locked", sendResponse);
  else checkPerms(state, request, sender, sendResponse);
}


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
function requirePerm(state: UrbitVisorState, type: Lock, sendResponse: any) {
  if (state.popupPreference == "window") openWindow();
  else {
    chrome.browserAction.setBadgeText({ text: "1" });
    chrome.browserAction.setBadgeBackgroundColor({ color: "#FF0000" });
    sendResponse({ status: type, response: null });
  }
}

function checkPerms(state: UrbitVisorState, request: any, sender: any, sendResponse: any) {
  console.log(request, "request for perms")
  fetchAllPerms(state.url)
    .then(res => {
      console.log(res, "perms")
      console.log(request, "request")
      const existingPerms = res.bucket[sender.origin];
      if (request.action === "check_perms") sendResponse({status: "ok", response: existingPerms});
      else if (!existingPerms || !existingPerms.includes(request.action)) {
        state.requestedPerms = { website: sender.origin, permissions: [request.action], existing: existingPerms };
        requirePerm(state, "noperms", sendResponse);
      }
      else if (request.action === "perms") bulkRequest(state, existingPerms, request, sender, sendResponse)
      else respond(state, request, sender, sendResponse);
    })
};

function bulkRequest(state: UrbitVisorState, existingPerms: any, request: any, sender: any, sendResponse: any) {
  if (existingPerms && request.data.every((el: UrbitVisorAction) => existingPerms.includes(el))) sendResponse("perms_exist")
  else {
    state.requestedPerms = { website: sender.origin, permissions: request.data, existing: existingPerms };
    requirePerm(state, "noperms", sendResponse);
  }
}


function respond(state: UrbitVisorState, request: any, sender: any, sendResponse: any): void {
  switch (request.action) {
    // visor endpoints
    case "perms":
      sendResponse({ status: "ok", response: "perms_exist" });
      break;
    case "shipName":
      sendResponse({ status: "ok", response: state.activeShip.shipName })
      break;
    case "shipURL":
      sendResponse({ status: "ok", response: state.url })
      break;
    case "scry":
      scry(state.url, request.data)
        .then(res => sendResponse({ status: "ok", response: res }))
        .catch(err => sendResponse({ error: err }))
      break;
    case "poke":
      const pokePayload = Object.assign(request.data, { onSuccess: handlePokeSuccess, onError: handleError });
      poke(state.activeShip.shipName, state.url, pokePayload)
        .then(res => sendResponse({ status: "ok", response: res }))
        .catch(err => sendResponse({ error: err }))
      break;
    case "thread":
      thread(state.url, request.data)
        .then(res => sendResponse({ status: "ok", response: res }))
        .catch(err => sendResponse({ error: err }))
      break;
    case "subscribe":
      const payload = Object.assign(request.data, { event: (event: any) => handleEvent(event, sender.tab.id), err: handleError })
      subscribe(state.activeShip.shipName, state.url, payload)
        .then(res => sendResponse({ status: "ok", response: res }))
        .catch(err => sendResponse({ error: err }))
      break;
    default: 
      sendResponse("invalid_request")
      break;
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