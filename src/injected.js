// import {getAll} from "./storage"


// function getAll(){
//   var port = chrome.runtime.connect({name: "knockknock"});
// port.postMessage({joke: "Knock knock"});
// port.onMessage.addListener(function(msg) {
//   if (msg.question == "Who's there?")
//     port.postMessage({answer: "Madame"});
//   else if (msg.question == "Madame who?")
//     port.postMessage({answer: "Madame... Bovary"});
// });
// };

function getAll(){
  console.log('message posted')
  window.postMessage({type: "urbit"}, window.origin)
}
console.log("testing injection")
window.urbit = {
    thing: "thing",
    thing2: "thing2",
    getAll: () => getAll()
  };
  
  function lol({ method, data }) {
    return new Promise((res, rej) => {
      const requestId = Math.random().toString(36).substr(2, 9);
      window.addEventListener('message', function responseHandler(e) {
        const response = e.data;
        if (
          typeof response !== 'object' ||
          response === null ||
          !response.target ||
          response.target !== TARGET ||
          !response.id ||
          response.id !== requestId ||
          !response.sender ||
          response.sender !== SENDER.extension
        )
          return;
        window.removeEventListener('message', responseHandler);
        if (response.error) rej(response.error);
        else res(response);
      });
      window.postMessage(
        {
          method,
          data,
          target: TARGET,
          sender: SENDER.webpage,
          id: requestId,
        },
        window.origin
      );
    });
  }