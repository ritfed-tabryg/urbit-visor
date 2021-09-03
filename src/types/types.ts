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

export interface BackgroundState {
  locked: boolean,
  cached_url: string,
  popupPreference: PopupPreference,
  requestedPerms: PermissionRequest,
  activeShip: EncryptedShipCredentials,
  url: string,
  permissions: PermissionsGraph
}

export type PopupPreference = "modal" | "window";

export interface PermissionRequest {
  website: string,
  permissions: Permission[],
  existing?: Permission[]
}
export type Permission = "shipName" | "shipURL" | "scry" | "thread" | "poke" | "subscribe"
export interface PermissionsGraph {
  [key: string] : Permission
}

export type UrbitVisorAction = "all" | "shipURL" | "perms"| "shipName" | "scry" | "poke" | "subscribe" | "thread" | "isLocked";
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
  app: "urbit-visor-internal",
  action: UrbitVisorInternalAction,
  data?: any
}