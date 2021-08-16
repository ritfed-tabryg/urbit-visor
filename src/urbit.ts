import { getSelected } from "./storage";
import Urbit from "@urbit/http-api";
import {Scry, Thread, Poke, SubscriptionRequestInterface} from "@urbit/http-api/src/types"
import * as CryptoJS from "crypto-js";
import { EncryptedShipCredentials } from "./types/types";

export async function savePermission(permission: any): Promise<void> {

}

export async function initPerms(ship: string, url: string){
    try {
      const res = await fetchPerms(url);
      return "exist"
    }catch{
        return setPerms(ship, url);
    }
}
export async function setPerms(ship: string, url: string){
    const airlock = new Urbit(url, "");
    airlock.ship = ship;
    const json =  {
        "put-bucket": {
          "bucket-key": "login-with-urbit-permissions",
          "bucket": {},
        }
      }
    // await openChannel(airlock);
    return await airlock.poke({app: "settings-store", mark: "settings-event", json: json })
}

export async function checkPerms(url: string, domain: string){
    const perms = await fetchPerms(url);
}
export async function fetchPerms(url: string){
  const payload = {app: "settings-store", path: "/bucket/login-with-urbit-permissions"};
  return await scry(url, payload)
}

export async function wipePerms(ship: string, url: string){
    const airlock = new Urbit(url, "");
    airlock.ship = ship;
    const json =  {
        "del-bucket": {
          "bucket-key": "login-with-urbit-permissions",
        }
      }
    return await airlock.poke({app: "settings-store", mark: "settings-event", json: json })
}

export async function openChannel(airlock: Urbit){
    await airlock.poke({ app: 'hood', mark: 'helm-hi', json: 'opening airlock' });
}

export async function scry(url: string, payload: Scry) {
    const airlock = new Urbit(url, "");
    const res = await airlock.scry(payload);
    return await res
}
export async function thread(url: string, payload: Thread<any>) {
    const airlock = new Urbit(url, "");
    const res = await airlock.thread(payload);
    return await res
}
export async function poke(ship: string, url: string, payload: Poke<any>) {
    const airlock = new Urbit(url, "");
    airlock.ship = ship;
    const res = await airlock.poke(payload);
    return await res
}
export async function subscribe(ship: string, url: string, payload: SubscriptionRequestInterface) {
    const airlock = new Urbit(url, "");
    airlock.ship = ship;
    const res = await airlock.subscribe(payload);
    return await res
}
export async function unsubscribe(ship: string, url: string, subscription: number) {
    const airlock = new Urbit(url, "");
    airlock.ship = ship;
    const res = await airlock.unsubscribe(subscription);
    return await res
}

// export async function scry(){

//     const airlock = new Urbit(url, "");
//     const res = await airlock.scry({app: "graph-store", path: "/keys"});
//     return await res;
// }

// export async function poke(){

// }

// export async function subscribe(){

// }