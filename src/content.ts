import {Messaging} from "./messaging";

const injectScript = () => {
  const script = document.createElement('script');
  script.async = false;
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function () {
    (this as any).remove();
  };
  (document.head || document.documentElement).appendChild(script);
  console.log("urbit visor injected")
};

function injectModal() {
  const background = document.createElement('div');
  background.style.cssText = 'display:none;opacity:0;background-color:rgb(0,0,0,0.7);position:absolute;top:0;left:0;width:100%;height:100%;transition: top 2s, opacity 2s;z-index:2147483646';
  background.id = "urbit-visor-modal-bg";
  const foreground = document.createElement('div');
  foreground.id = "urbit-visor-modal-fg";
  foreground.style.cssText = 'color:white;background-color:black;border:3px solid red;position:absolute;top:20px;right:50px;width:200px;height:200px;padding:0.5rem;text-align:center;font-weight:700;z-index:2147483647';
  const logo = document.createElement('div');
  logo.style.cssText = "margin: auto"
  logo.innerHTML = `
<svg width="68" height="68" viewBox="0 0 450 450" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="225" cy="225" r="225" fill="black"/>
<path d="M143.097 105C133.319 105 102.761 124.103 99.0942 127.576L104.9 142.627L140.839 161.602C145.626 154.849 153.181 135.681 155.32 124.682C157.036 115.858 152.875 105 143.097 105Z" fill="url(#paint0_linear)"/>
<path d="M399 222.488C399 205.147 387.232 199.366 378.593 201.191C342.957 213.665 277.47 206.059 248.839 197.845C220.208 189.63 156.549 161.336 144.975 157.076C112.08 145.515 100.616 131.824 99.0941 127.565C72.5945 200.887 15.2218 293.627 82.5358 325.018C183.658 372.176 319.808 326.235 347.83 306.155C375.852 286.075 399 239.83 399 222.488Z" fill="white"/>
<mask id="mask0" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="51" y="127" width="348" height="219">
<path d="M398.788 222.54C398.788 205.191 387.028 199.408 378.395 201.234C342.785 213.713 277.344 206.104 248.733 197.886C220.123 189.668 156.509 161.361 144.943 157.1C112.072 145.534 100.616 131.838 99.095 127.576C72.6142 200.929 15.2822 293.708 82.5485 325.112C183.599 372.289 319.652 326.329 347.654 306.241C375.656 286.153 398.788 239.889 398.788 222.54Z" fill="#F0F0F0"/>
</mask>
<g mask="url(#mask0)">
<path d="M86.312 373.314L194.362 113.271L295.49 152.398L213.324 383.547L86.312 373.314Z" fill="url(#paint1_linear)"/>
<ellipse cx="144.196" cy="229.465" rx="96.3234" ry="168.484" transform="rotate(23.6845 144.196 229.465)" fill="url(#paint2_linear)"/>
<path d="M185.914 284.053C287.248 296.221 396.017 212.229 410.218 204.031L374.859 313.856L193.868 360.264L76.3008 332.419L-18.8155 226.988C15.6495 241.954 104.846 274.319 185.914 284.053Z" fill="url(#paint3_linear)"/>
</g>
<path fill-rule="evenodd" clip-rule="evenodd" d="M143.309 209.164C126.786 201.613 111.222 207.997 101.027 215.081C90.7396 222.228 82.9477 231.953 79.6219 237.655L92.3461 245.076C94.7021 241.037 101.082 232.979 109.431 227.178C117.8 221.363 127.622 218.151 137.265 222.598L137.391 222.656L137.52 222.709C140.879 224.107 143.549 226.687 145.895 230.044C147.672 232.585 148.938 235.033 150.239 237.548C150.765 238.563 151.295 239.589 151.868 240.636C152.2 241.245 152.592 242.006 153.035 242.866C154.329 245.381 156.065 248.751 158.062 251.698C160.931 255.932 164.981 260.411 171.047 263.216C180.737 267.695 191.12 266.069 199.009 262.164C206.994 258.211 213.567 251.662 218.137 245.266L206.152 236.703C202.556 241.735 197.706 246.373 192.475 248.962C187.434 251.458 181.839 251.977 177.229 249.845C174.43 248.552 172.241 246.365 170.256 243.435C168.785 241.265 167.732 239.215 166.578 236.969C166.025 235.894 165.45 234.773 164.794 233.573C164.487 233.012 164.125 232.311 163.711 231.51C162.325 228.829 160.361 225.027 157.968 221.604C154.733 216.976 150.111 212.032 143.309 209.164Z" fill="url(#paint4_linear)"/>
<defs>
<linearGradient id="paint0_linear" x1="127.395" y1="105" x2="127.395" y2="161.602" gradientUnits="userSpaceOnUse">
<stop stop-color="#969696"/>
<stop offset="1" stop-color="#303030" stop-opacity="0.88"/>
</linearGradient>
<linearGradient id="paint1_linear" x1="105.274" y1="174.971" x2="244.023" y2="362.78" gradientUnits="userSpaceOnUse">
<stop stop-color="white"/>
<stop offset="1" stop-color="#7B6F6F" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint2_linear" x1="245.499" y1="242.551" x2="58.1133" y2="252.733" gradientUnits="userSpaceOnUse">
<stop stop-color="#7C7C7C" stop-opacity="0.59"/>
<stop offset="1" stop-color="#E0E0E0" stop-opacity="0"/>
<stop offset="1" stop-color="#EFEFEF" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint3_linear" x1="299.882" y1="418.953" x2="208.705" y2="200.548" gradientUnits="userSpaceOnUse">
<stop stop-color="#4E4E4E"/>
<stop offset="1" stop-color="#ACACAC" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint4_linear" x1="127.617" y1="259.099" x2="160.448" y2="198.66" gradientUnits="userSpaceOnUse">
<stop stop-color="#686868"/>
<stop offset="1" stop-color="#707070" stop-opacity="0"/>
</linearGradient>
</defs>
</svg>
  `
  const arrow = document.createElement("p");
  arrow.innerText = "↑";
  arrow.style.cssText = "font-size: 3rem; margin: 0";
  const message = document.createElement("p");
  message.style.cssText = "margin-top: 0; margin-bottom: 2px; overflow: hidden;"
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
