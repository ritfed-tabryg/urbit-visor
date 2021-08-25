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
        // unlock();
        rej("locked")
      // reject promise if there are no valid permissions
      } else if(event.data == "noperms"){
        // promptPassword();
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

// function unlock() {
//   const background = document.getElementById("lwu-modal-bg")
//   background.style.display = "block";
//   const modal = document.getElementById("lwu-modal-fg");
//   modal.innerText = "Please select a ship first."
//   setTimeout(()=> background.style.display = "none", 1000);
// }

// function promptPassword(){
//   const background = document.getElementById("lwu-modal-bg")
//   background.style.display = "block";
//   const modal = document.getElementById("lwu-modal-fg");
//   modal.innerText= "You do not have permissions. Input your password to unlock Login With Urbit"
//   const input = document.createElement('input');
//   input.type = "password";
//   input.id = "lwu-pw-input";
//   const button = document.createElement("button");
//   button.id = "submit-urbit-login";
//   button.innerText = "Submit";
//   modal.appendChild(input);
//   modal.appendChild(button);
//   button.onclick = () => {
//     (window as any).urbit.test(input.value)
//   }
//   setTimeout(()=> background.style.display = "none", 1000);
// }



(window as any).urbit = {
  getShip: () => requestData("shipName"),
  requestPermissions: (permissions: LWURequest[]) => requestData("perms", permissions),
  scry: (payload: Scry) => requestData("scry", payload),
  poke: (payload: Poke<any>) => requestData("poke", payload),
  thread: (payload: Thread<any>) => requestData("thread", payload),
  subscribe: (payload: SubscriptionRequestInterface) => requestData("subscribe", payload)
};