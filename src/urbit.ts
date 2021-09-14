import Urbit from "@urbit/http-api";
import { Scry, Thread, Poke, SubscriptionRequestInterface } from "@urbit/http-api/src/types"
import { EncryptedShipCredentials, PermissionRequest } from "./types/types";



export async function fetchShipname(url: string): Promise<string>{
  return new Promise(async (resolve, reject) => {
    try{
      const res = await fetch(url.replace(/\/$/g, '') + "/who.json");
      const json = await res.json();
      resolve(json.who)
    } catch{
      reject("OTA outdated")
    }
  })
}
// todo
export async function connectToShip(url: string, shipName: string): Promise<any>{
  const airlock = new Urbit(url, "");
    airlock.ship = shipName;
    airlock.verbose = true;
    await airlock.poke({ app: 'hood', mark: 'helm-hi', json: 'opening airlock' });
    return airlock;
}

export async function loginToShip(url: string, code: string): Promise<any>{
  const controller = new AbortController()
  setTimeout(() => { controller.abort() }, 5000)
  const res = await fetch(url.replace(/\/$/g, '') + "/~/login", {
    body: `password=${code}`,
    method: "POST",
    credentials: "include",
    redirect: "follow",
    signal: controller.signal
  })
  return res
}
export async function savePermission(permission: any): Promise<void> {

}
// this should go through the background script really
export async function initPerms(shipName: string, url: string) {
  const airlock = new Urbit(url, "");
  airlock.ship = shipName;
  try {
    const res = await fetchAllPerms(url);
    return "exist"
  } catch {
    return setPerms(airlock);
  }
}
export async function setPerms(airlock: Urbit) {
  const json = {
    "put-bucket": {
      "bucket-key": "urbit-visor-permissions",
      "bucket": {},
    }
  }
  // await openChannel(airlock);
  return await airlock.poke({ app: "settings-store", mark: "settings-event", json: json })
}

export async function grantPerms(airlock: Urbit, perms: PermissionRequest) {
  let value;
  const existing = await checkPerms(airlock.url, perms.website);
  const set = new Set(existing);
  if (existing) {
    for (let p of perms.permissions) set.add(p);
    value = Array.from(set);
  }
  else value = perms.permissions;

  const json = {
    "put-entry": {
      "bucket-key": "urbit-visor-permissions",
      "entry-key": perms.website,
      "value": value
    }
  }
  return await airlock.poke({app: "settings-store", mark: "settings-event", json: json })
}

export async function revokePerms(url: string, shipName: string, perms: PermissionRequest) {
  const airlock = new Urbit(url, "");
  airlock.ship = shipName;
  let value;
  const existing = await checkPerms(url, perms.website);
  const set = new Set(existing)
  if (existing) {
    for (let p of perms.permissions) set.delete(p);
    value = Array.from(set);
  }
  else value = perms.permissions;

  const json = {
    "put-entry": {
      "bucket-key": "urbit-visor-permissions",
      "entry-key": perms.website,
      "value": value
    }
  }
  return await airlock.poke({app: "settings-store", mark: "settings-event", json: json })
}

export async function deleteDomain(ship: string, url: string, domain: string){
  const airlock = new Urbit(url, "");
  airlock.ship = ship;
  const json = {
    "del-entry": {
      "bucket-key": "urbit-visor-permissions",
      "entry-key": domain,
    }
  }
  return await airlock.poke({app: "settings-store", mark: "settings-event", json: json })
}

export async function checkPerms(url: string, domain: string) {
  const perms = await fetchAllPerms(url);
  const domainPerms = perms.bucket[domain];
  return await domainPerms
}
export async function fetchAllPerms(url: string) {
  const airlock = new Urbit(url, "");
  const payload = { app: "settings-store", path: "/bucket/urbit-visor-permissions" };
  return await scry(airlock, payload)
}

export async function wipeAllPerms(ship: string, url: string) {
  const airlock = new Urbit(url, "");
  airlock.ship = ship;
  const json = {
    "del-bucket": {
      "bucket-key": "urbit-visor-permissions",
    }
  }
  return await airlock.poke({ app: "settings-store", mark: "settings-event", json: json })
};

export async function openChannel(airlock: Urbit) {
  await airlock.poke({ app: 'hood', mark: 'helm-hi', json: 'opening airlock' });
};

export async function scry(airlock: Urbit, payload: Scry) {
  return await airlock.scry(payload);
};

export async function thread(airlock: Urbit, payload: Thread<any>) {
  return await airlock.thread(payload);
};

// Pokes take two optional callbacks, onSuccess and onError
export async function poke(airlock: Urbit, payload: Poke<any>) {
  return await airlock.poke(payload);
};

// subscriptions take two optional callbacks, event() and err()
export async function subscribe(airlock: Urbit, payload: SubscriptionRequestInterface) {
  return await airlock.subscribe(payload);
};

export async function unsubscribe(airlock: Urbit, ship: string, subscription: number) {
  airlock.ship = ship;
  return await airlock.unsubscribe(subscription);
};
