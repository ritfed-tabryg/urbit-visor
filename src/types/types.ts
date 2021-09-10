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


export interface UrbitVisorState{
  first: boolean,
  ships: EncryptedShipCredentials[],
  cached_url: string,
  popupPreference: PopupPreference,
  requestedPerms: PermissionRequest,
  selectedShip: EncryptedShipCredentials,
  activeShip: EncryptedShipCredentials,
  url: string,
  permissions: PermissionsGraph,
  init: () => Promise<void>,
  setMasterPassword: (password: string) => Promise<void>,
  addShip: (ship: string, url: string, code: string, pw: string) => Promise<void>,
  cacheURL: (string: string) => void,
  removeShip: (ship: EncryptedShipCredentials) => Promise<void>,
  selectShip: (ship: EncryptedShipCredentials) => void,
  connectShip: (url: string, ship: EncryptedShipCredentials) => Promise<void>,
  disconnectShip: () => void,
  grantPerms: (perms: PermissionRequest) => Promise<void>,
  denyPerms: () => void,
  removeWholeDomain: (domain: string) => void,
  revokePerm: (ship: EncryptedShipCredentials, url: string, perms: PermissionRequest) => Promise<void>,
  loadPerms: (permissions: PermissionsGraph) => void,
  changePopupPreference: (preference: PopupPreference) => Promise<void>,
  changeMasterPassword: (oldPassword: string, newPassword: string) => Promise<void>
  resetApp: () => Promise<void>,
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

export type UrbitVisorAction = "check_perms" | "shipURL" | "perms"| "shipName" | "scry" | "poke" | "subscribe" | "thread" | "isLocked";
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