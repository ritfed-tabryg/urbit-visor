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

function injectModal(){
  const background = document.createElement('div');
  background.style.cssText = 'background-color:rgb(0,0,0,0.7);position:absolute;top:0;left:0;width:100vw;height:100vh;display:none;';
  background.id = "lwu-modal-bg";
  document.body.appendChild(background)
  // 
  const foreground = document.createElement('div');
  const modaltext = document.createElement('p');
  modaltext.innerText= "Input your password to unlock Login With Urbit"
  const input = document.createElement('input');
  input.type = "password"
  foreground.appendChild(modaltext)
  foreground.appendChild(input)
  const button = document.createElement("button");
  button.id = "submit-urbit-login";
  button.innerText = "Submit";
  foreground.appendChild(button)
  foreground.style.cssText = 'background-color:white;position:absolute;top:50%;left:50%;width:400px;height:100px;display:none;';
  foreground.id = "lwu-modal-fg";
  document.body.appendChild(foreground)
}
  // function shouldInject() {
  //   const documentElement = document.documentElement.nodeName;
  //   const docElemCheck = documentElement
  //     ? documentElement.toLowerCase() === 'html'
  //     : true;
  //   const { docType } = window.document;
  //   const docTypeCheck = docType ? docType.name === 'html' : true;
  //   return docElemCheck && docTypeCheck;
  // }
  // if (shouldInject) {
    injectScript();
    // injectModal();
    // Messaging.createProxyController();
  // }

// listen to messages from the injected script (i.e. websites)
// and relays those to the background script, where data is fetched
window.addEventListener("message", (event) =>{
  console.log(event, "content script receiving window message")
  if(event.data && event.data.app === "urbit"){
    console.log('calling background script');
// and listens to the response from the background script after the data is fetched
// then relays that back to the injected script
  chrome.runtime.sendMessage(event.data, (res) => {
    console.log('receiving response from background script')
    window.postMessage(res, window.origin)
  });
  }
}, false);