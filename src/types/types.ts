
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

export interface BackgroundController {
  locked: boolean,
  adding: boolean,
  cached_url: string,
  requestedPerms: PermissionRequest,
  activeShip: EncryptedShipCredentials,
  url: string,
  permissions: PermissionsGraph
}

export interface PermissionRequest {
  website: string,
  permissions: string[]
}
type Permission = "shipName" | "scry" | "thread" | "poke" | "subscribe"
export interface PermissionsGraph {
  [key: string] : Permission
}

export type LWURequest = "all" | "shipName" | "scry" | "poke" | "subscribe" | "thread" | "isLocked";
