import * as React from "react";
import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { validate } from "../../storage";
import { fetchAllPerms, revokePerms, deleteDomain } from "../../urbit";
import "./perms.css";
import Sigil from "../ui/svg/Sigil"
import { Chip } from "./PermissionsPrompt";
import { whatShip, processName } from "../../utils"
import { EncryptedShipCredentials, PermissionRequest, Permission } from "../../types/types"

interface PermissionsProps {
    ship: EncryptedShipCredentials,
    shipURL: string,
    perms: any,
    setThemPerms: (url: string) => void
}


export default function Permissions(props: PermissionsProps) {
    const [query, search] = useState("");
    const [toDisplay, display] = useState("");
    const domains = Object.keys(props.perms).sort();
    console.log(props.perms, "perms list")
    const displayName = processName(props.ship.shipName);
    const shipname = whatShip(props.ship.shipName) === "moon"
        ? <p className="moonname shipname"><span>~{displayName.slice(0, -14)}</span><span>{displayName.slice(-14)}</span></p>
        : <p className="shipname">~{displayName}</p>



    return (
        <div className="permissions small-padding perms-flex-grow-wrapper">
            <div className="ship-data">
                <Sigil size={78} patp={props.ship.shipName} />
                {shipname}
            </div>
            <input onChange={(e) => search(e.currentTarget.value)} value={query} placeholder="search domain" type="text" />
            <div className="permslist perms-flex-grow-wrapper">
                {!domains.length
                    ? <p>No permissions granted</p>
                    : !query.length
                        ? domains.map((domain) => <Domain setThemPerms={props.setThemPerms} shipURL={props.shipURL} ship={props.ship} key={domain} domain={domain} perms={props.perms[domain]} />)
                        : domains.filter((d) => d.includes(query)).map((domain) => <Domain setThemPerms={props.setThemPerms} shipURL={props.shipURL} ship={props.ship} key={domain} domain={domain} perms={props.perms[domain]} />)
                }
            </div>
        </div>
    )
}

interface DomainProps {
    domain: string,
    ship: EncryptedShipCredentials,
    shipURL: string,
    perms: Permission[],
    setThemPerms: (url: string) => void
}
function Domain({ ship, shipURL, domain, perms, setThemPerms }: DomainProps) {
    async function revokePerm(perm: Permission) {
        const p = { website: domain, permissions: [perm] };
        revokePerms(ship.shipName, shipURL, p)
            .then(res => {
                if (typeof res === "number") setThemPerms(shipURL) // set perms anew
            })
            .catch(err => console.log(err))
    }
    const [toDisplay, display] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [revokingPerm, setRevoking] = useState<Permission>(null);
    const displayterms = toDisplay == domain ? <DisplayPerms promptRevokePerm={(perm: Permission) => promptRevoke(perm)} perms={perms} /> : <div />

    function uncollapse(domain: string) {
        if (toDisplay == domain) display("")
        else display(domain)
    }
    function eraseDomain() {
        deleteDomain(ship.shipName, shipURL, domain)
            .then(res => {
                if (typeof (res) === "number") setThemPerms(shipURL)
            })
            .catch(err => console.log(err))
    }
    function promptDelete(){
        setRevoking(null);
        setDeleting(true);
    }
    function promptRevoke(perm: Permission){
        setDeleting(false);
        setRevoking(perm);
    }
    return (
        <div className="domain-wrapper perms-flex-grow-wrapper">
            <div className="domain">
                <p onClick={() => uncollapse(domain)} className="domain-text">{domain}</p>
                <button className="minibutton red-bg" onClick={promptDelete} ></button>
            </div>
            {displayterms}
            {deleting && <ConfirmationPrompt message={"Delete domain?"} cancel={() => setDeleting(false)} revoke={eraseDomain} />}
            {revokingPerm && <ConfirmationPrompt message={`Revoke ${revokingPerm} permission?`} cancel={() => setRevoking(null)} revoke={() => revokePerm(revokingPerm)} />}
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
    revoke: () => void
}
function ConfirmationPrompt({ message, cancel, revoke }: ConfirmationProps) {
    return (
        <div className="perm-deletion-confirmation-prompt">
            <p>{message}</p>
            <div className="two-buttons">
                <button className="small-button red-bg" onClick={cancel} >No</button>
                <button className="small-button right" onClick={revoke}> Yes</button>
            </div>
        </div>
    )
}
