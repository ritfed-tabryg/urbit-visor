console.log("testing injection")

type LWURequest = "all" | "active" | "scry" | "poke" | "subscribe";

function requestData(request: LWURequest, data : any = null){
  return new Promise((res, rej) => {
    window.addEventListener("message", function handler(event) {
      // don't listen to messages from this same page
      if (event.data.type) return;
      window.removeEventListener('message', handler);
      if (event.data.error) rej(event.data.error);
      else res(event.data);
    }, false);
    window.postMessage({ app: "urbit", type: request, data: data }, window.origin);
  });
}



(window as any).urbit = {
  getAll: () => requestData("all"),
  getShip: () => requestData("active"),
  scry: (resource: any) => requestData("scry", resource),
  poke: (path: any) => requestData("poke", path),
  subscribe: (subscription: any) => requestData("subscribe", subscription),
};