import * as React from "react";
import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { AES } from "crypto-js";
import { validate } from "../../storage";
import { fetchAllPerms } from "../../urbit";
import "./perms.css";
import Sigil from "../ui/svg/Sigil"
import { processName } from "../../utils"
import { EncryptedShipCredentials, PermissionRequest } from "../../types/types"

interface PermissionsProps {
    active: EncryptedShipCredentials,
    perms: any
}


export default function Permissions(props: PermissionsProps) {
    const [query, search] = useState("");
    const [toDisplay, display] = useState("");
    const domains = Object.keys(props.perms).sort();
    console.log(props.perms, "perms list")
    const displayName = processName(props.active.shipName);

 

    return (
        <div className="permissions">
            <div className="data">
                <Sigil size={78} patp={props.active.shipName} />
                <p className="shipname">~{displayName}</p>
            </div>
            <input onChange={(e) => search(e.currentTarget.value)} value={query} placeholder="search domain" type="text" />
            <div className="permslist">
                {!query.length 
                ? domains.map((domain) => <Domain domain={domain} perms={props.perms[domain]}/>)
                : domains.filter((d) => d.includes(query)).map((domain) => <Domain domain={domain} perms={props.perms[domain]}/>)
            }
            </div>
        </div>
    )
}

interface DomainProps{
    domain: string,
    perms: string[]
}
function Domain({domain, perms}: DomainProps){
    const [toDisplay, display] = useState("");
    const displayterms = toDisplay == domain ? <DisplayPerms perms={perms} /> : <div />

    function uncollapse(domain : string){
        if (toDisplay == domain) display("")
        else display(domain)
      }
    return(
        <>
        <p className="domain" onClick={() => uncollapse(domain)} key={domain}>{domain}</p>
        {displayterms}
        </>
    )
}

interface DPProps {
  perms: string[]
}
function DisplayPerms({perms}: DPProps){
  return(
      <div className="grantedperms">
        {perms.map((perm) => <p key={perm}>{perm}</p>)}
      </div>
  )
}