import {Scry, Thread, Poke, SubscriptionRequestInterface} from "@urbit/http-api/src/types"

type LWURequest = "all" | "ship" | "scry" | "poke" | "subscribe" | "thread" | "isLocked";

function requestData(request: LWURequest, data : any = null){
  return new Promise((res, rej) => {
    window.addEventListener("message", function handler(event) {
      // don't listen to messages from this same page
      if (event.data && event.data.app === "urbit") return;
      window.removeEventListener('message', handler);
      if (event.data.error) rej(event.data.error);
      else res(event.data);
    }, false);
    window.postMessage({ app: "urbit", type: request, data: data }, window.origin);
  });
}

function unlock(){
  document.getElementById("lwu-modal-bg").style.display = "block";
  document.getElementById("lwu-modal-fg").style.display = "block";
}



(window as any).urbit = {
  unlock: () => unlock(),
  isLocked: () => requestData("isLocked"),
  getAll: () => requestData("all"),
  getShip: () => requestData("ship"),
  scry: (payload: Scry) => requestData("scry", payload),
  poke: (payload: Poke<any>) => requestData("poke", payload),
  thread: (payload: Thread<any>) => requestData("thread", payload),
  subscribe: (payload: SubscriptionRequestInterface) => requestData("subscribe", payload),
};