import * as CryptoJS from "crypto-js";
import { EncryptedShipCredentials } from "./types/types";

interface Permission{
    thing: string
}

interface Storage{
    ships?: EncryptedShipCredentials[],
    selected?: EncryptedShipCredentials,
    password?: string
    permissions?: Permission[]
}
export const getStorage = (key: string | string[]) : Promise<Storage> =>
  new Promise((res, rej) =>
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) rej(undefined);
      res(result);
    })
  );
export const setStorage = (item: { [key: string]: any; }) : Promise<any> =>
  new Promise((res, rej) =>
    chrome.storage.local.set(item, () => {
      if (chrome.runtime.lastError) rej(chrome.runtime.lastError);
      res(true);
    })
  );

// setters
export async function storeCredentials(ship: string, url: string, code: string, pw: string): Promise<any>{
    const encryptedURL = encrypt(url, pw).toString();
    const encryptedCode = encrypt(code, pw).toString();
    const encryptedCredentials: EncryptedShipCredentials = {
      shipName: ship,
      encryptedShipURL: encryptedURL,
      encryptedShipCode: encryptedCode,
    }
    const res : any = await getStorage("ships");
    if (res["ships"]){
        const new_ships = res["ships"];
        // TODO prevent duplicates
        new_ships.push(encryptedCredentials);
        return setStorage({ ships: new_ships });
    } else{
        const new_ships = [encryptedCredentials];
        return setStorage({ ships: new_ships });
    }
    // chrome.storage.local.get("ships", (res) => {
    //     if (res["ships"]) {
    //       let new_ships = res["ships"];
    //       new_ships.push(encryptedCredentials);
    //       return setStorage({ ships: new_ships });
    //     } else {
    //       let new_ships = [encryptedCredentials];
    //       return setStorage({ ships: new_ships });
    //     }
    // });

};

export function savePassword(password: string) : Promise<any>{
    const encryptedString = encrypt("lwu", password);
    return setStorage({password: encryptedString})
}
export function saveSelection(ship: EncryptedShipCredentials):Promise<any>{
    return setStorage({selected: ship})
}

export function reset(){
    chrome.storage.local.clear();
}


// getters

export async function getAll():Promise<any>{
    return new Promise((resolve, reject) =>{
        chrome.storage.local.get(["ships", "selected"], (res) => {
            if (res["ships"] && res["ships"].length){
                resolve(res);
            } else{
                reject("data not set");
            }
        });
    })
};
export async function getShips(): Promise<any>{
    return new Promise((resolve, reject) =>{
        chrome.storage.local.get("ships", (res) => {
            if (res["ships"] && res["ships"].length){
                resolve(res);
            } else{
                reject("data not set");
            }
        });
    })
};
export async function getSelected(): Promise<any>{
    return new Promise((resolve, reject) =>{
        chrome.storage.local.get("selected", (res) => {
            if (res){
                resolve(res);
            } else{
                reject("No ship selected");
            }
        });
    })
};

// encryption utils 
export function encrypt(target: string, password: string): string {
    return CryptoJS.AES.encrypt(target, password).toString();
}
export function decrypt(target: string, password: string): string {
    return CryptoJS.AES.decrypt(target, password).toString(CryptoJS.enc.Utf8);
}

// export async function getShips(){
//     chrome.storage.local.get(["ships"], (res) => {
//         if (res["ships"] && res["ships"].length) {
//           console.log(res, "res")
//           setFirst(false)
//         } else{
//           setFirst(true)
//         }
//         setShips(res["ships"]);
//         setSelected(res["selected"]);
//         console.log(ships, "ships");
//       });
// }



// const getStorage = (key) =>
//   new Promise((res, rej) =>
//     chrome.storage.local.get(key, (result) => {
//       if (chrome.runtime.lastError) rej(undefined);
//       res(result);
//     })
//   );

//   async function check(){
//       const r = await getStorage("password");
//       if (r.ships){
//           return r
//       }else{
//         return "oops"
//       }
//   }