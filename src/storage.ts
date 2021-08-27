import * as CryptoJS from "crypto-js";
import { EncryptedShipCredentials, PopupPreference } from "./types/types";

interface Permission{
    thing: string
}

interface Storage{
    ships?: EncryptedShipCredentials[],
    selected?: EncryptedShipCredentials,
    password?: string,
    popup?: PopupPreference,
    permissions?: Permission[]
}

export async function validate(password: string): Promise<boolean>{
    const res = await getStorage("password");
    const string = decrypt(res.password, password);
    if (string === "urbit_visor") return true 
    else return false
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
    const res = await getStorage("ships");
    if (res["ships"]?.length){
        const ships = res["ships"];
        console.log(res.ships, "ships")
        let new_ships;
        if (ships.filter(sp => sp.shipName == ship).length) new_ships = ships;
        else new_ships = [...ships, encryptedCredentials];
        await setStorage({ ships: new_ships });
        return encryptedCredentials;
    } else{
        const new_ships = [encryptedCredentials];
        await setStorage({ ships: new_ships });
        return encryptedCredentials;
    }
};

export function savePassword(password: string) : Promise<any>{
    const encryptedString = encrypt("urbit_visor", password);
    return setStorage({password: encryptedString})
}

export function reset(): Promise<any>{
    return new Promise((resolve, reject) => {
        chrome.storage.local.clear(()=>{
            if (chrome.runtime.lastError) reject(undefined);
            resolve("ok");
        });
    })
}
export function setPopupPreference(preference: PopupPreference): Promise<any>{
  return setStorage({popup: preference})
}

export async function initStorage(password: string): Promise<any>{
  await setPopupPreference("modal");
  return savePassword(password);
}

export async function removeShip(ship: EncryptedShipCredentials): Promise<any>{
    // TODO error handling?
    const res = await getStorage("ships");
    const new_ships = res["ships"].filter((el: EncryptedShipCredentials) => el.shipName !== ship.shipName);
    return setStorage({ships: new_ships});  
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
export async function getPreference(): Promise<any>{
    return new Promise((resolve, reject) =>{
        chrome.storage.local.get("popup", (res) => {
            if (res["popup"]){
                resolve(res.popup);
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
    if (password === "") return ""
    return CryptoJS.AES.decrypt(target, password).toString(CryptoJS.enc.Utf8);
}