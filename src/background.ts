import Urbit from "@urbit/http-api";
import {getAll} from "./storage"

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


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(request, "message received")
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.type == "gimme")
        sendResponse({farewell: "goodbye"});
    }
  );