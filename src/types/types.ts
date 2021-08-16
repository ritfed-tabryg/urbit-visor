
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

export interface PermissionRequest {
  website: string,
  permissions: string[]

}

export interface BackgroundController {
  locked: boolean,
  perms: PermissionRequest,
  activeShip: EncryptedShipCredentials,
  url: string,

}