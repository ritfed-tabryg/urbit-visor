import { Scry, Thread, Poke, SubscriptionRequestInterface } from "@urbit/http-api/src/types"
import {LWURequest} from "./types/types"


function requestData(request: LWURequest, data: any = null) {
  return new Promise((res, rej) => {
    window.addEventListener("message", function handler(event) {
      console.log(event, "window message received by injected script")
      // don't listen to messages from this same page
      if (event.data && event.data.app === "urbit") return;
      // remove listener so they don't keep stacking up
      window.removeEventListener('message', handler);
      // reject promise if received an error
      if (event.data && event.data.error) {
        rej(event.data.error);
      // reject promise if no ship is connected, i.e. extension is "locked"
      } else if(event.data == "locked"){
        promptUnlock();
        rej("locked")
      // reject promise if there are no valid permissions
      } else if(event.data == "noperms"){
        promptPerms();
        rej("noperms");
      }
      // resolve promise if permissions exist
      else { 
        res(event.data); 
      }
    }, false);
    console.log(data, "trying to post this message")
    window.postMessage({ app: "urbit", type: request, data: data }, window.origin);
  });
}

function promptUnlock(){
  const background = document.getElementById("urbit-visor-modal-bg")
  background.style.display = "block";
  background.style.opacity = "0.8";
  const modalText = document.getElementById("urbit-visor-modal-text");
  modalText.innerText = "Please open your Urbit Visor and connect to a ship.";
  setTimeout(()=> background.style.display = "none", 2000);
}
function promptPerms(){
  const background = document.getElementById("urbit-visor-modal-bg")
  background.style.display = "block";
  background.style.opacity = "0.8";
  const modalText = document.getElementById("urbit-visor-modal-text");
  modalText.innerText = "Please open your Urbit Visor to grant permissions.";
  setTimeout(()=> background.style.display = "none", 2000);
}


(window as any).urbitVisor = {
  getShip: () => requestData("shipName"),
  getURL: () => requestData("shipURL"),
  requestPermissions: (permissions: LWURequest[]) => requestData("perms", permissions),
  scry: (payload: Scry) => requestData("scry", payload),
  poke: (payload: Poke<any>) => requestData("poke", payload),
  thread: (payload: Thread<any>) => requestData("thread", payload),
  subscribe: (payload: SubscriptionRequestInterface) => requestData("subscribe", payload)
};