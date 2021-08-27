import { createElement } from "react";

const injectScript = () => {
  console.log("testing injection content")
  const script = document.createElement('script');
  script.async = false;
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function () {
    (this as any).remove();
  };
  (document.head || document.documentElement).appendChild(script);
};

function injectModal() {
  const background = document.createElement('div');
  background.style.cssText = 'display:none;opacity:0;background-color:rgb(0,0,0,0.7);position:absolute;top:0;left:0;width:100vw;height:100vh;transition: top 2s, opacity 2s;';
  background.id = "urbit-visor-modal-bg";
  const foreground = document.createElement('div');
  foreground.id = "urbit-visor-modal-fg";
  foreground.style.cssText = 'background-color:grey;position:absolute;top:20px;right:50px;width:200px;height:200px;padding:0.5rem;';
  const logo = document.createElement('div');
  logo.innerHTML = `
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="16" cy="16" r="13" fill="white" stroke="black" stroke-width="2"/>
<path d="M22 14.0488H19.6306C19.4522 15.0976 18.9936 15.7317 18.1783 15.7317C16.7006 15.7317 15.8599 14 13.5669 14C11.3503 14 10.1783 15.3659 10 17.9756H12.3694C12.5478 16.9024 13.0064 16.2683 13.8471 16.2683C15.3248 16.2683 16.1146 18 18.4586 18C20.6242 18 21.8217 16.6341 22 14.0488Z" fill="black"/>
</svg>
  `
  const arrow = document.createElement("p");
  arrow.innerText = "↑";
  arrow.style.cssText = "font-size: 3rem; margin: 0 auto;";
  const message = document.createElement("p");
  message.id = "urbit-visor-modal-text";
  foreground.appendChild(arrow);
  foreground.appendChild(message);
  foreground.appendChild(logo);
  background.appendChild(foreground);
  document.body.appendChild(background);
}

// function injectFrame() {
//   const i = document.createElement('iframe')
//   const p = document.createElement('div');
//   p.style.cssText = "width: 357px; height: 600px; position: fixed; top:0; right:50px;";
//   i.style.cssText = "width: 357px; height: 600px;";

//   const b = document.createElement('button')
//   b.innerHTML = 'Open'
//   b.addEventListener('click', (evt) => {
//     evt.preventDefault()
//     chrome.runtime.sendMessage({ open: true }, (response) => {
//       console.log(response, "response")
//       i.src = response
//       p.appendChild(i)
//     })
//   })
//   const b2 = document.createElement('button');
//   b2.innerHTML = "Close";
//   b2.onclick = () => p.removeChild(i);
//   p.appendChild(b)
//   p.appendChild(b2)
//   document.body.appendChild(p);
// }
function injectFrame() {
  const i = document.createElement('iframe');
  // (i as any).sandbox = "allow-scripts allow-same-origin"
  const p = document.createElement('div');
  p.style.cssText = "width: 357px; height: 600px; position: fixed; top:0; right:50px;";
  i.style.cssText = "width: 357px; height: 600px;";
  chrome.runtime.sendMessage({ open: true }, (response) => {
    console.log(response, "response")
    i.src = response
    p.appendChild(i)
  })
  const b2 = document.createElement('button');
  b2.innerHTML = "Close";
  b2.onclick = () => document.body.removeChild(p);
  p.appendChild(b2)
  document.body.appendChild(p);
}
function shouldInject(): boolean {
  const documentElement = document.documentElement.nodeName;
  const docElemCheck = documentElement
    ? documentElement.toLowerCase() === 'html'
    : true;
  const { doctype } = window.document;
  const docTypeCheck = doctype ? doctype.name === 'html' : true;
  return docElemCheck && docTypeCheck;
}
if (shouldInject()) {
  injectScript();
  injectModal();
}

// listen to messages from the injected script (i.e. websites)
// and relays those to the background script, where data is fetched
window.addEventListener("message", (event) => {
  console.log(event, "content script receiving window message")
  if (event.data && event.data.app === "urbit") {
    console.log('calling background script');
    // and listens to the response from the background script after the data is fetched
    // then relays that back to the injected script
    chrome.runtime.sendMessage(event.data, (res) => {
      console.log(res, 'receiving response from background script')
      // if background script response is "locked" or "noperms" inject popup into page
      if (res == "locked" || res == "noperms") {
        console.log('injecting iframe');
        window.postMessage(res, window.origin)
        // const iframe = document.querySelector('iframe');
        // console.log(iframe, "iframe exists")
        // // only inject iframe if one doesn't already exist, else they keep stacking up
        // if(!iframe) injectFrame();
      } else {
        // permissions exist, so relay data from background script into page
        window.postMessage(res, window.origin)
      }
    });
  }
}, false);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request, "fetching sse from background at content")
  if (request.app == "urbit-sse") {
    console.log("sending sse to injected script")
    window.postMessage(request, window.origin)
    sendResponse("content script sent response to background")
  }
});