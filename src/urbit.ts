import Urbit from "@urbit/http-api";
import { Scry, Thread, Poke, SubscriptionRequestInterface } from "@urbit/http-api/src/types"
import { EncryptedShipCredentials, PermissionRequest } from "./types/types";


export async function fetchShipname(url: string): Promise<string>{
  const res = await fetch(url.replace(/\/$/g, '') + "/who.json");
  const json = await res.json();
  return await json.who;
}

export async function connectToShip(url: string, shipName: string): Promise<any>{
  const airlock = new Urbit(url, "");
    airlock.ship = shipName;
    // airlock.verbose = true;
    return airlock.poke({ app: 'hood', mark: 'helm-hi', json: 'opening airlock' })
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

export async function initPerms(ship: string, url: string) {
  try {
    const res = await fetchAllPerms(url);
    return "exist"
  } catch {
    return setPerms(ship, url);
  }
}
export async function setPerms(ship: string, url: string) {
  const airlock = new Urbit(url, "");
  airlock.ship = ship;
  const json = {
    "put-bucket": {
      "bucket-key": "urbit-visor-permissions",
      "bucket": {},
    }
  }
  // await openChannel(airlock);
  return await airlock.poke({ app: "settings-store", mark: "settings-event", json: json })
}

export async function grantPerms(ship: string, url: string, perms: PermissionRequest) {
  const airlock = new Urbit(url, "");
  airlock.ship = ship;
  let value;
  const existing = await checkPerms(url, perms.website);
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

export async function revokePerms(ship: string, url: string, perms: PermissionRequest) {
  const airlock = new Urbit(url, "");
  airlock.ship = ship;
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
  const payload = { app: "settings-store", path: "/bucket/urbit-visor-permissions" };
  return await scry(url, payload)
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
}

export async function openChannel(airlock: Urbit) {
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
// Pokes take two optional callbacks, onSuccess and onError
export async function poke(ship: string, url: string, payload: Poke<any>) {
  const airlock = new Urbit(url, "");
  airlock.ship = ship;
  const res = await airlock.poke(payload);
  return await res
}
// subscriptions take two optional callbacks, event() and err()
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
