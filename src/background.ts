import Urbit from "@urbit/http-api";
import {getAll, getSelected} from "./storage"

// opens extension in a full screen tab to use devtools properly, to delete in production
function openTab(filename : string) {
    const myid = chrome.i18n.getMessage("@@extension_id");
    console.log(myid, "myid")
    chrome.windows.getCurrent(function (win) {
        chrome.tabs.query({ 'windowId': win.id }, function (tabArray) {
            for (let i in tabArray) {
                if (tabArray[i].url == "chrome-extension://" + myid + "/" + filename) {
                    // console.log("already opened"); 
                    chrome.tabs.update(tabArray[i].id, { active: true }); return;
                }
            } chrome.tabs.create({ url: chrome.extension.getURL(filename) });
        });
    });
}
openTab("popup.html")

// background listener handles messages from the content script, fetches data from the extension, then sends back a response to the content script 
chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>{
  console.log(request, "background script receiving message from content script")
  console.log(sender.tab 
    ? "from a content script:" + sender.tab.url 
    : "from the extension");
  switch (request.type){
    case "all":
      getAll()
      .then(res => sendResponse({res: res}))
      .catch(err => sendResponse({err: err}))
      break;
    case "active":
      getSelected()
      .then(res =>sendResponse({res: res.selected}))
      .catch(err => sendResponse({err: err}))
      break;
    case "scry":
      console.log("scry");
      break;
    case "poke":
      console.log("poke");
      break;
    case "subscribe":
        console.log("subscribe");
    break;
    default: break;
  }
  return true
});