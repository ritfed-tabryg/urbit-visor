import * as React from "react";
import { useState, useEffect } from "react";
import { fetchAllPerms } from "../../urbit";
import { Messaging } from "../../messaging";
import "./perms.css";
import Sigil from "../ui/svg/Sigil";
import { Chip } from "./PermissionsPrompt";
import { whatShip, processName } from "../../utils";
import { motion } from "framer-motion";
import { EncryptedShipCredentials, PermissionsGraph, Permission } from "../../types/types"
interface PermissionsProps {
    ship: EncryptedShipCredentials,
    shipURL: string,
    perms?: any
}


export default function Permissions({ ship, shipURL, ...props }: PermissionsProps) {
    const [perms, setPerms] = useState<PermissionsGraph>({});

    useEffect(() => {
        let isMounted = true;
        fetchAllPerms(shipURL).then(res => {
            if (isMounted) setPerms(res.bucket)
        });
        return () => { isMounted = false };
    }, []);

    const [query, search] = useState("");
    const domains = Object.keys(perms).sort();
    const displayName = processName(ship.shipName);
    const shipname = whatShip(ship.shipName) === "moon"
        ? <p className="moonname shipname"><span>~{displayName.slice(0, -14)}</span><span>{displayName.slice(-14)}</span></p>
        : <p className="shipname">~{displayName}</p>

    function doDeleteDomain(domain: string) {
        Messaging.sendToBackground({ action: "remove_whole_domain", data: {url: shipURL, ship: ship.shipName, domain: domain}})
            .then(res => {
                fetchAllPerms(shipURL).then(res => setPerms(res.bucket));
            })
            .catch(err => console.log(err, "error"))
    };
    function revokePerm(domain: string, perm: Permission) {
        Messaging.sendToBackground({ action: "revoke_perm", data: {url: shipURL, ship: ship.shipName, request: { website: domain, permissions: [perm] }}})
            .then(res => {
                fetchAllPerms(shipURL).then(res => {
                    setPerms(res.bucket)
                });
            })
            .catch(err => console.log(err, "error"))
    }



    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="permissions small-padding perms-flex-grow-wrapper">
            <div className="ship-data">
                <Sigil size={78} patp={ship.shipName} />
                {shipname}
            </div>
            <div className="permission-search">
                <input onChange={(e) => search(e.currentTarget.value)} value={query} placeholder="Search" type="text" />
            </div>
            <div className="permslist perms-flex-grow-wrapper">
                {!domains.length
                    ? <p>No permissions granted</p>
                    : !query.length
                        ? domains.map((domain) => <Domain shipURL={shipURL} ship={ship} key={domain} domain={domain} perms={perms[domain]} deleteDomain={doDeleteDomain} revokePerm={revokePerm} />)
                        : domains.filter((d) => d.includes(query)).map((domain) => <Domain shipURL={shipURL} ship={ship} key={domain} domain={domain} perms={perms[domain]} deleteDomain={doDeleteDomain} revokePerm={revokePerm} />)
                }
            </div>
        </motion.div>
    )
}

interface DomainProps {
    domain: string,
    ship: EncryptedShipCredentials,
    shipURL: string,
    perms: Permission[],
    deleteDomain: (domain: string) => void
    revokePerm: (domain: string, perm: Permission) => void
}
function Domain({ ship, shipURL, domain, perms, deleteDomain, revokePerm }: DomainProps) {
    const [toDisplay, display] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [revokingPerm, setRevoking] = useState<Permission>(null);
    const displayterms = toDisplay == domain ? <DisplayPerms promptRevokePerm={(perm: Permission) => promptRevoke(perm)} perms={perms} /> : <div />

    function uncollapse(domain: string) {
        if (toDisplay == domain) display("")
        else display(domain)
    }

    function promptDelete() {
        setRevoking(null);
        setDeleting(true);
    }
    function promptRevoke(perm: Permission) {
        setDeleting(false);
        setRevoking(perm);
    }
    function dispatchDeleteDomain() {
        deleteDomain(domain);
        setDeleting(false);
    }
    function dispatchRevokePerm() {
        revokePerm(domain, revokingPerm);
        setRevoking(null);
    }
    return (
        <div className="domain-wrapper perms-flex-grow-wrapper">
            <div className="domain">
                <p onClick={() => uncollapse(domain)} className="domain-text">{domain}</p>
                <button className="minibutton red-bg" onClick={promptDelete} ></button>
            </div>
            {displayterms}
            {deleting && <ConfirmationPrompt message={"Delete domain?"} cancel={() => setDeleting(false)} confirm={dispatchDeleteDomain} />}
            {revokingPerm && <ConfirmationPrompt message={`Revoke ${revokingPerm} permission?`} cancel={() => setRevoking(null)} confirm={dispatchRevokePerm} />}
        </div>

    )
}

interface DPProps {
    perms: Permission[],
    promptRevokePerm: (perm: Permission) => void
}
function DisplayPerms({ perms, promptRevokePerm }: DPProps) {
    if (perms.length) return (
        <div className="grantedperms flex-grow">
            {perms.map((perm) => <IndividualPerm key={perm} promptRevokePerm={promptRevokePerm} perm={perm} />)}
        </div>
    )
    else return (
        <p>No permissions</p>
    )
}
interface IPProps {
    perm: Permission
    promptRevokePerm: (perm: Permission) => void
}
function IndividualPerm({ perm, promptRevokePerm }: IPProps) {
    const revoke = () => promptRevokePerm(perm);
    return (
        <>
            <div onClick={revoke} className="permission-string" key={perm}>
                <Chip type={"old"} perm={perm} />
            </div>
        </>
    )
}
interface ConfirmationProps {
    message: string,
    cancel: () => void
    confirm: () => void
}
function ConfirmationPrompt({ message, cancel, confirm }: ConfirmationProps) {
    return (
        <div className="perm-deletion-confirmation-prompt">
            <p>{message}</p>
            <div className="two-buttons">
                <button className="small-button red-bg" onClick={cancel} >No</button>
                <button className="small-button right" onClick={confirm}> Yes</button>
            </div>
        </div>
    )
}
