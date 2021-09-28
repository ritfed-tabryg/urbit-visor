import { EncryptedShipCredentials, UrbitVisorAction, UrbitVisorInternalAction, UrbitVisorInternalComms, UrbitVisorState } from "./types/types";

import { fetchAllPerms } from "./urbit"
import { useStore } from "./store";
import { EventEmitter } from 'events';
import { Messaging } from "./messaging";
import { SubscriptionRequestInterface } from "@urbit/http-api";

export const Pusher = new EventEmitter();


async function init() {
  const state = useStore.getState();
  await state.init();
  // listen to changes in popup preference in storage
  storageListener();
  messageListener();
  portListener();
};
init();

function storageListener() {
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    const state = useStore.getState();
    if (changes.popup) state.changePopupPreference(changes.popup.newValue);
    if (changes.permissions) state.loadPerms(changes.permissions.newValue);
    if (changes.ships) {
      if (state.activeShip && deletedWasActive(state.activeShip, changes.ships.newValue, changes.ships.oldValue)) {
        state.disconnectShip();
      }
      state.init().then(res => console.log("visor state initialized"))
    }
  });
}

function deletedWasActive(activeShip: EncryptedShipCredentials, newShips: EncryptedShipCredentials[], oldShips: EncryptedShipCredentials[]) {
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

function portListener() {
  chrome.runtime.onConnect.addListener(function (port) {
    console.log(port, "background script onConnect")
    port.onMessage.addListener(function (msg) {
      console.log(msg, "background script received message through port")
    });
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
        .then(res => {
          console.log("password set")
          sendResponse("ok");
        });
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
      if (state.activeShip) {
        state.disconnectShip();
        const recipients = new Set(state.consumers.map(consumer => consumer.tabID));
        Messaging.pushEvent({ action: "disconnected", data: { ship: state.activeShip.shipName } }, recipients)
      }
      state.connectShip(request.data.url, request.data.ship)
        .then(res => {
          chrome.browserAction.setBadgeText({ text: "" });
          const recipients = new Set(state.consumers.map(consumer => consumer.tabID));
          Messaging.pushEvent({ action: "connected"}, recipients)
          sendResponse("ok")
        })
        .catch(err => sendResponse(null));
      break;
    case "disconnect_ship":
      state.disconnectShip();
      const recipients = new Set(state.consumers.map(consumer => consumer.tabID));
      Messaging.pushEvent({ action: "disconnected"}, recipients)
      sendResponse("ok");
      break;
    case "grant_perms":
      console.log(request, "granting perms")
      state.grantPerms(request.data.request)
        .then(res => {
          chrome.browserAction.setBadgeText({ text: "" });
          const recipients = new Set(state.consumers
            .filter(consumer => consumer.url.origin === request.data.request.website)
            .map(consumer => consumer.tabID)
            );
          // only if url coincides with the website
          Messaging.pushEvent({ action: "permissions_granted", data: request.data.request }, recipients)
          sendResponse("ok")
        })
      break;
    case "deny_perms":
      state.denyPerms();
      chrome.browserAction.setBadgeText({ text: "" });
      sendResponse("ok");
      break;
    case "remove_whole_domain":
      state.removeWholeDomain(request.data.url, request.data.ship, request.data.domain)
        .then(res => {
          const recipients = new Set(state.consumers
            .filter(consumer => consumer.url.origin === request.data.domain)
            .map(consumer => consumer.tabID)
          );
          // only if url coincides with the website
          Messaging.pushEvent({ action: "permissions_revoked", data: request.data }, recipients)
          sendResponse("ok")
        })
      break;
    case "revoke_perm":
      state.revokePerm(request.data.url, request.data.ship, request.data.request)
        .then(res => {
          const recipients = new Set(state.consumers
            .filter(consumer => consumer.url.origin === request.data.request.website)
            .map(consumer => consumer.tabID)
          );    
          // only if url coincides with the website, need "tabs" permissions to implement
          Messaging.pushEvent({ action: "permissions_revoked", data: request.data.request }, recipients)
          sendResponse("ok")
        })
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
  state.addConsumer({tabID: sender.tab.id, url: new URL(sender.tab.url)});
  if (request.action == "check_connection") sendResponse({ status: "ok", response: !!state.activeShip })
  else if (request.action == "unsubscribe") respond(state, request, sender, sendResponse)
  else if (!state.activeShip) requirePerm(state, "locked", sendResponse)
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
  fetchAllPerms(state.airlock.url)
    .then(res => {
      const existingPerms = res.bucket[sender.origin] || [];
      if (request.action === "check_perms") sendResponse({ status: "ok", response: existingPerms });
      else if (request.action === "perms") bulkRequest(state, existingPerms, request, sender, sendResponse)
      else if (!existingPerms || !existingPerms.includes(request.action)) {
        state.requestPerms(sender.origin, [request.action], existingPerms)
        requirePerm(state, "noperms", sendResponse);
      }
      else respond(state, request, sender, sendResponse);
    })
};

function bulkRequest(state: UrbitVisorState, existingPerms: any, request: any, sender: any, sendResponse: any) {
  if (existingPerms && request.data.every((el: UrbitVisorAction) => existingPerms.includes(el))) sendResponse("perms_exist")
  else {
    state.requestPerms(sender.origin, request.data, existingPerms);
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
      sendResponse({ status: "ok", response: state.airlock })
      break;
    case "scry":
      state.airlock.scry(request.data)
        .then(res => sendResponse({ status: "ok", response: res }))
        .catch(err => sendResponse({ status: "error", response: err }))
      break;
    case "poke":
      const pokePayload = Object.assign(request.data, {
        onSuccess: () => handlePokeSuccess(request.data, sender.tab.id, request.id),
        onError: (e: any) => handlePokeError(e, request.data, sender.tab.id, request.id)
      });
      state.airlock.poke(pokePayload)
        .then(res => sendResponse({ status: "ok", response: res }))
        .catch(err => sendResponse({ status: "error", response: err }))
      break;
    case "thread":
      state.airlock.thread(request.data)
        .then(res => sendResponse({ status: "ok", response: res }))
        .catch(err => sendResponse({ status: "error", response: err }))
      break;
    case "subscribe":
      const existing = state.activeSubscriptions.find(sub => {
        return (
          sub.subscription.app == request.data.payload.app &&
          sub.subscription.path == request.data.payload.path)
      });
      console.log(state, "state")
      console.log(request, "request")
      console.log(state.activeSubscriptions, "active")
      console.log(existing, "existing")
      if (!existing) {
        const payload = Object.assign(request.data.payload, {
          event: (event: any) => handleEvent(event, request.data.payload, request.id),
          err: (error: any) => handleSubscriptionError(error, request.data, sender.tab.id, request.id)
        });
        if (request.data.once){
          state.airlock.subscribeOnce(request.data.payload.app, request.data.payload.path)
            .then(event => {
              console.log(event, "event from subscribeonce")
              handleOneOffEvent(event, sender.tab.id, request.id)
            })
        } else{
        state.airlock.subscribe(payload)
          .then(res => {
            console.log(res, "subscription added to airlock");
            state.addSubscription({ subscription: request.data.payload, subscriber: sender.tab.id, airlockID: res, requestID: request.id });
            sendResponse({ status: "ok", response: res });
          })
          .catch(err => sendResponse({ status: "error", response: err }))
        }
      } else if (existing.subscriber !== sender.tab.id){
        state.addSubscription({ subscription: request.data.payload, subscriber: sender.tab.id, airlockID: existing.airlockID, requestID: request.id  });
        sendResponse({ status: "ok", response: "piggyback" })
      } else sendResponse({ status: "ok", response: "noop" })
      break;
    case "unsubscribe":
      state.airlock.unsubscribe(request.data)
        .then(res => {
          sendResponse({ status: "ok", response: res })
          const sub = state.activeSubscriptions.find(sub => sub.airlockID === request.data && sub.subscriber === sender.tab.id)
          state.removeSubscription(sub)
        })
        .catch(err => sendResponse({ status: "error", response: err }))
      break;
    case "on":
      sendResponse({ status: "ok", response: request.data.thing })
    default:
      sendResponse({ status: "error", response: "invalid_request" })
      break;
  }
}

function handlePokeSuccess(poke: any, tab_id: number, requestID: string) {
  Messaging.pushEvent({ action: "poke_success", data: poke, requestID: requestID }, new Set([tab_id]))
}

function handleOneOffEvent(event: any, recipient: number, requestID: string){
  Messaging.pushEvent({ action: "sse", data: event, requestID: requestID }, new Set([recipient]))
}

function handleEvent(event: any, subscription: SubscriptionRequestInterface, requestID: string) {
  setTimeout(()=> {
    const state = useStore.getState();
    const recipients = 
      state.activeSubscriptions
        .filter(sub => sub.subscription.app === subscription.app && sub.subscription.path === subscription.path)
        .map(sub => sub.subscriber)
    // console.log(subscription, "subscription issuing the SSE")
    // console.log(state.activeSubscriptions, "state")
    Messaging.pushEvent({ action: "sse", data: event, requestID: requestID}, new Set(recipients))
  }, 2000)
}
function handlePokeError(error: any, poke: any, tab_id: number, requestID: string) {
  Messaging.pushEvent({ action: "poke_error", data: poke, requestID: requestID }, new Set([tab_id]))
}
function handleSubscriptionError(error: any, subscription: any, tab_id: number, requestID: string) {
  Messaging.pushEvent({ action: "subscription_error", data: subscription, requestID: requestID }, new Set([tab_id]))
}