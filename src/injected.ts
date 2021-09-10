import { Scry, Thread, Poke, SubscriptionRequestInterface } from "@urbit/http-api/src/types";
import {UrbitVisorAction, UrbitVisorRequest} from "./types/types";
import {Messaging} from "./messaging";

function promptUnlock(){
  const background = document.getElementById("urbit-visor-modal-bg");
  background.style.display = "block";
  background.style.opacity = "0.8";
  const modalText = document.getElementById("urbit-visor-modal-text");
  modalText.innerText = "Please open your Urbit Visor and connect to a ship.";
  setTimeout(()=> background.style.display = "none", 3000);
}
function promptPerms(){
  const background = document.getElementById("urbit-visor-modal-bg");
  background.style.display = "block";
  background.style.opacity = "0.8";
  const modalText = document.getElementById("urbit-visor-modal-text");
  modalText.innerText = "Please open your Urbit Visor to grant permissions.";
  setTimeout(()=> background.style.display = "none", 3000);
}

async function requestData(action: UrbitVisorAction, data: any = null): Promise<any>{
  return new Promise(async (resolve, reject) =>{
    const response = await Messaging.callVisor({app: "urbitVisor", action: action, data: data});
    if (response.status === "locked") promptUnlock(), reject();
    else if (response.status == "noperms") promptPerms(), reject();
    else if (response.error) reject(response)
    else resolve(response)
  })
};

async function checkConnection(): Promise<boolean>{
  const response = await Messaging.callVisor({app: "urbitVisor", action: "shipName"});
  if (response.status === "locked") return false
  else return true
}
async function checkPermissions(): Promise<any>{
  const response = await Messaging.callVisor({app: "urbitVisor", action: "check_perms"})
  return response
}


(window as any).urbitVisor = {
  isConnected: () => checkConnection(),
  authorizedPermissions: () => checkPermissions(),
  getShip: () => requestData("shipName"),
  getURL: () => requestData("shipURL"),
  requestPermissions: (permissions: UrbitVisorAction[]) => requestData("perms", permissions),
  scry: (payload: Scry) => requestData("scry", payload),
  poke: (payload: Poke<any>) => requestData("poke", payload),
  thread: (payload: Thread<any>) => requestData("thread", payload),
  subscribe: (payload: SubscriptionRequestInterface) => requestData("subscribe", payload)
};