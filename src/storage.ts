import { EncryptedShipCredentials } from "./types/types";

// setters
export function storeCredentials(ships: EncryptedShipCredentials): void{
    chrome.storage.local.get("ships", (res) => {
        if (res["ships"]) {
          let new_ships = res["ships"];
          new_ships.push(ships);
          chrome.storage.local.set({ ships: new_ships });
        } else {
          let new_ships = [ships];
          chrome.storage.local.set({ ships: new_ships });
        }
    });
};

export function saveSelection(ship: EncryptedShipCredentials):void{
    chrome.storage.local.set({selected: ship})
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