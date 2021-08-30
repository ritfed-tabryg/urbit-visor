import * as React from "react";
import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { validate } from "../../storage";
import { fetchAllPerms, revokePerms, deleteDomain } from "../../urbit";
import "./perms.css";
import Sigil from "../ui/svg/Sigil"
import { processName } from "../../utils"
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



    return (
        <div className="permissions">
            <div className="ship-data">
                <Sigil size={78} patp={props.ship.shipName} />
                <p className="shipname">~{displayName}</p>
            </div>
            <input onChange={(e) => search(e.currentTarget.value)} value={query} placeholder="search domain" type="text" />
            <div className="permslist">
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
    const displayterms = toDisplay == domain ? <DisplayPerms revokePerm={revokePerm} perms={perms} /> : <div />

    function uncollapse(domain: string) {
        if (toDisplay == domain) display("")
        else display(domain)
    }
    function eraseDomain(){
      deleteDomain(ship.shipName, shipURL, domain)
      .then(res => {
        if (typeof(res) === "number") setThemPerms(shipURL)
       })
      .catch(err => console.log(err))
    }
    return (
        <>
            <div className="domain">
                <p className="domain-text">{domain}</p>
                <button onClick={() => uncollapse(domain)} >Show</button>
                <button onClick={eraseDomain} >Delete </button>
            </div>
            {displayterms}
        </>

    )
}

interface DPProps {
    perms: Permission[],
    revokePerm: (perm: Permission) => void
}
function DisplayPerms({ perms, revokePerm }: DPProps) {
    if (perms.length) return (
        <div className="grantedperms">
            {perms.map((perm) => <IndividualPerm key={perm} revokePerm={revokePerm} perm={perm} />)}

        </div>
    )
    else return (
        <p>No permissions</p>
    )
}
interface IPProps {
    perm: Permission
    revokePerm: (perm: Permission) => void
}
function IndividualPerm({ perm, revokePerm }: IPProps) {
    const [showRevoke, setShowRevoke] = useState(null);
    function promptRevoke() {
        showRevoke === perm ? setShowRevoke(null) : setShowRevoke(perm)
    };
    const revoke = () => revokePerm(perm);
    return (
        <>
            <p onClick={promptRevoke} className="permission-string" key={perm}>{perm}</p>
            {showRevoke === perm &&
                <>
                    <p>Revoke permission?</p>
                    <div className="two-buttons">
                    <button className="small-button red-bg" onClick={() => setShowRevoke(null)} >No</button>
                    <button className="small-button right" onClick={revoke}> Yes</button>
                    </div>
                </>
            }
        </>
    )
}