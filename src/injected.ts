import { Scry, Thread, Poke, SubscriptionRequestInterface } from "@urbit/http-api/src/types"

type LWURequest = "all" | "ship" | "scry" | "poke" | "subscribe" | "thread" | "isLocked";

function requestData(request: LWURequest, data: any = null) {
  return new Promise((res, rej) => {
    window.addEventListener("message", function handler(event) {
      // don't listen to messages from this same page
      if (event.data && event.data.app === "urbit") return;
      window.removeEventListener('message', handler);
      if (event.data.error) {
        rej(event.data.error);
      } else if(event.data == "locked"){
        // unlock();
        rej("locked")
      } else if(event.data == "noperms"){
        // promptPassword();
        rej("noperms");
      }
      else { 
        res(event.data); 
      }
    }, false);
    window.postMessage({ app: "urbit", type: request, data: data }, window.origin);
  });
}

function unlock() {
  const background = document.getElementById("lwu-modal-bg")
  background.style.display = "block";
  const modal = document.getElementById("lwu-modal-fg");
  modal.innerText = "Please select a ship first."
  setTimeout(()=> background.style.display = "none", 1000);
}

function promptPassword(){
  const background = document.getElementById("lwu-modal-bg")
  background.style.display = "block";
  const modal = document.getElementById("lwu-modal-fg");
  modal.innerText= "You do not have permissions. Input your password to unlock Login With Urbit"
  const input = document.createElement('input');
  input.type = "password";
  input.id = "lwu-pw-input";
  const button = document.createElement("button");
  button.id = "submit-urbit-login";
  button.innerText = "Submit";
  modal.appendChild(input);
  modal.appendChild(button);
  button.onclick = () => {
    (window as any).urbit.test(input.value)
  }
  setTimeout(()=> background.style.display = "none", 1000);
}



(window as any).urbit = {
  test: (thing: string) =>  window.postMessage({ app: "openModal" }, window.origin),
  unlock: () => unlock(),
  isLocked: () => requestData("isLocked"),
  getAll: () => requestData("all"),
  getShip: () => requestData("ship"),
  scry: (payload: Scry) => requestData("scry", payload),
  poke: (payload: Poke<any>) => requestData("poke", payload),
  thread: (payload: Thread<any>) => requestData("thread", payload),
  subscribe: (payload: SubscriptionRequestInterface) => requestData("subscribe", payload),
};