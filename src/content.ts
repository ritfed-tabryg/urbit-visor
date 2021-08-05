import  { getAll } from "./storage";




console.log("Testing")

window.addEventListener('load', loadEvent => {
    let window = loadEvent.currentTarget;
    (window as any).document.title='You changed me!';
    (window as any).urbit = {lmao: "lol"};
});


// function codeToInject(thing: any):void {
//     getAll()
//     .then(res => {
//       (window as any).urbit = res
//       console.log(res)

//     });
//     // Do here whatever your script requires. For example:
//     // (window as any).urbit = thing;    
// }

// function embed(fn: Function) {
//     const script = document.createElement("script");
//     script.text = `(${fn.toString()})();`;
//     document.documentElement.appendChild(script);
// }

// embed(codeToInject);

// function injectScript(file_path: string, tag: string) {
//     var node = document.getElementsByTagName(tag)[0];
//     var script = document.createElement('script');
//     script.setAttribute('type', 'text/javascript');
//     script.setAttribute('src', file_path);
//     node.appendChild(script);
// }
// injectScript(chrome.extension.getURL('urbit.js'), 'body');

// const header = document.createElement("h3");
// header.innerHTML = "Test <h5>Injection test</h5>"

// const body = document.getElementsByTagName("body");
// body[0]?.prepend(header);
