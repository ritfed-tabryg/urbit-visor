import Urbit from "@urbit/http-api";
import { Scry, Thread, Poke, SubscriptionRequestInterface } from "@urbit/http-api/src/types"

export type DecryptedShipCredentials = {
  shipName: string;
  shipURL: string;
  shipCode: string;
};

export type EncryptedShipCredentials = {
  shipName: string;
  encryptedShipURL: string;
  encryptedShipCode: string;
};

type TabID = number;

interface WebsiteSubscription {
  subscription: SubscriptionRequestInterface,
  subscriber: TabID,
  airlockID: number,
  requestID: string
}

interface UrbitVisorConsumer{
  tabID: number,
  url: URL
}


export interface UrbitVisorState{
  airlock: Urbit,
  first: boolean,
  ships: EncryptedShipCredentials[],
  cached_url: string,
  popupPreference: PopupPreference,
  requestedPerms: PermissionRequest,
  selectedShip: EncryptedShipCredentials,
  activeShip: EncryptedShipCredentials,
  permissions: PermissionsGraph,
  consumers: UrbitVisorConsumer[],
  activeSubscriptions: WebsiteSubscription[],
  init: () => Promise<void>,
  setMasterPassword: (password: string) => Promise<void>,
  addShip: (ship: string, url: string, code: string, pw: string) => Promise<void>,
  cacheURL: (string: string) => void,
  removeShip: (ship: EncryptedShipCredentials) => Promise<void>,
  selectShip: (ship: EncryptedShipCredentials) => void,
  connectShip: (url: string, ship: EncryptedShipCredentials) => Promise<void>,
  disconnectShip: () => void,
  requestPerms: (website: string, permissions: Permission[], existing: Permission[]) => void,
  grantPerms: (perms: PermissionRequest) => Promise<void>,
  denyPerms: () => void,
  removeWholeDomain: (url: string, ship: string, domain: string) => Promise<void>,
  revokePerm: (url: string, ship: string, perms: PermissionRequest) => Promise<void>,
  loadPerms: (permissions: PermissionsGraph) => void,
  changePopupPreference: (preference: PopupPreference) => Promise<void>,
  changeMasterPassword: (oldPassword: string, newPassword: string) => Promise<void>
  resetApp: () => Promise<void>,
  addConsumer: (consumer: UrbitVisorConsumer) => void
  addSubscription: (sub: WebsiteSubscription) => void,
  removeSubscription: (sub: WebsiteSubscription) => void
}

export type PopupPreference = "modal" | "window";

export interface PermissionRequest {
  website: string,
  permissions: Permission[],
  existing?: Permission[]
}
export type Permission = "shipName" | "shipURL" | "scry" | "thread" | "poke" | "subscribe"
export interface PermissionsGraph {
  [key: string] : Permission[]
}

export type UrbitVisorAction = "on" | "check_connection" | "check_perms" | "shipURL" | "perms"| "shipName" | "scry" | "poke" | "subscribe" | "subscribeOnce" | "unsubscribe" | "thread";
export type UrbitVisorInternalAction = "state" | "connected" | "cache_form_url" | "end_url_caching" | "dismiss_perms";
type UrbitVisorRequestType = Scry | Thread<any> | Poke<any> | SubscriptionRequestInterface | UrbitVisorAction[]

export interface UrbitVisorRequest{
  app: "urbitVisor",
  action: UrbitVisorAction,
  data?: UrbitVisorRequestType
}
export interface UrbitVisorResponse{
  id: string,
  status: "locked" | "noperms" | "ok"
  response?: any
  error?: any
}

export interface UrbitVisorInternalComms {
  action: UrbitVisorInternalAction | string,
  data?: any
}

export interface UrbitVisorEvent {
  action: UrbitVisorEventType
  requestID?: string,
  data?: any
}
export type UrbitVisorEventType =  UrbitVisorInternalEvent | UrbitEvent

type UrbitVisorInternalEvent = "connected" | "disconnected" | "permissions_granted" | "permissions_revoked" 
type UrbitEvent =  "sse" | "poke_success" | "poke_error" | "subscription_error"