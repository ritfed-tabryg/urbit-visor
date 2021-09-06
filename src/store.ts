import { UrbitVisorState } from "./types/types";
import { getStorage, decrypt, initStorage, storeCredentials, removeShip, setPopupPreference, reEncryptAll, savePassword, resetApp } from "./storage";
import { fetchAllPerms, connectToShip, grantPerms, revokePerms, deleteDomain } from "./urbit";
import { Messaging } from "./messaging";
import create from 'zustand';


export const useStore = create<UrbitVisorState>((set, get) => ({
    first: true,
    ships: [],
    cached_url: "",
    popupPreference: "modal",
    requestedPerms: null,
    selectedShip: null,
    activeShip: null,
    url: null,
    permissions: {},
    init: async () => {
        const res = await getStorage(["popup", "ships", "password", "permissions"]);
        set(state => ({ first: !("password" in res), popupPreference: res.popup || "modal", ships: res.ships || [], permissions: res.permissions || {}}))
    },
    setMasterPassword: async (password) => {
        await initStorage(password);
        set(state => ({ first: false }));
    },
    addShip: async (ship, url, code, pw) => {
        const creds = await storeCredentials(ship, url, code, pw);
        set(state => ({ selectedShip: creds }));
    },
    cacheURL: (string: string) => set(state => ({cached_url: string})),
    removeShip: async (ship) => {
        const ships = await removeShip(ship);
        set(state => { ships: ships });
    },
    selectShip: (ship) => set(state => ({ selectedShip: ship })),
    connectShip: async (url, ship) => {
        await connectToShip(url, ship.shipName);
        set(state => ({ activeShip: ship, url: url }));
    },
    disconnectShip: () => set(state => ({ activeShip: null })),
    grantPerms: async (perms) => {
        const shipName = (get() as any).activeShip.shipName;
        const url = (get() as any).url
        await grantPerms(shipName, url, perms);
        set(state => ({ requestedPerms: null }))
    },
    denyPerms: () => set(state => ({ requestedPerms: null })),
    removeWholeDomain: async (domain) => {

    },
    revokePerm: async (ship, url, permRequest) => {
        const res = await revokePerms(ship.shipName, url, permRequest);
        const perms = await fetchAllPerms(url);
        set(state => ({permissions: perms}))
    },
    loadPerms:  (permissions:any) => {
        set(state => ({permissions: permissions}))
    },
    changePopupPreference: async (preference) => {
        await setPopupPreference(preference);
        set(state => ({ popupPreference: preference }));
    },
    changeMasterPassword: async (oldPassword, password) => {
        await reEncryptAll(oldPassword, password);
        await savePassword(password);
    },
    resetApp: async () => await resetApp()
}))

