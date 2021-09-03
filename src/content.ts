import {Messaging} from "./messaging";

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
  foreground.style.cssText = 'background-color:black;border:3px solid red;position:absolute;top:20px;right:50px;width:200px;height:200px;padding:0.5rem;text-align:center;font-weight:700;';
  const logo = document.createElement('div');
  logo.style.cssText = "margin: auto"
  logo.innerHTML = `
  <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="16" cy="16" r="13" fill="white" stroke="black" stroke-width="2"/>
<path d="M22 14.0488H19.6306C19.4522 15.0976 18.9936 15.7317 18.1783 15.7317C16.7006 15.7317 15.8599 14 13.5669 14C11.3503 14 10.1783 15.3659 10 17.9756H12.3694C12.5478 16.9024 13.0064 16.2683 13.8471 16.2683C15.3248 16.2683 16.1146 18 18.4586 18C20.6242 18 21.8217 16.6341 22 14.0488Z" fill="black"/>
</svg>
  `
  const arrow = document.createElement("p");
  arrow.innerText = "↑";
  arrow.style.cssText = "font-size: 3rem; margin: 0";
  const message = document.createElement("p");
  message.id = "urbit-visor-modal-text";
  foreground.appendChild(arrow);
  foreground.appendChild(message);
  foreground.appendChild(logo);
  background.appendChild(foreground);
  document.body.appendChild(background);
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
  Messaging.createProxyController();
}
