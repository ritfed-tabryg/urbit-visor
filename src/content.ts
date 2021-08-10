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