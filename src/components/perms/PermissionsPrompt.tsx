import * as React from "react";
import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { AES } from "crypto-js";
import { validate } from "../../storage";
import "./perms.css";
import { PermissionRequest, Permission } from "../../types/types"


interface PermissionsProps {
    perms: PermissionRequest
    savePerms: (pw: string, perms: PermissionRequest) => Promise<any>
}
export default function PermissionsPrompt(props: PermissionsProps) {
    console.log(props.perms, "perms")
    const history = useHistory();
    const [perms, setPerms] = useState<Permission[]>([]);
    const [pw, setPw] = useState("");
    const [error, setError] = useState("");
    useEffect(()=> setPerms(props.perms.permissions), []);
    function removePerm(perm: Permission){
        const new_perms = perms.filter(p => p != perm);
        setPerms(new_perms);
    }

    async function grant() {
        const valid = await validate(pw);
        if (valid) {
            setError("");
            const request = {website: props.perms.website, permissions: perms}
            props.savePerms(pw, request)
              .then((res) => {
                chrome.runtime.sendMessage({ type: "dismissPerms" });
                history.push("/");
                window.close();
              })
              .catch(err => setError("Connection error"))
        }
        else setError("Wrong password");
    }
    async function deny() {
        chrome.runtime.sendMessage({ type: "dismissPerms" });
        history.push("/");
        window.close();
    }
    return (
        <div className="permissions padding flex-grow-wrapper">
            <h3>Permissions Requested</h3>
            <div className="flex-grow">
            <a href={props.perms.website} rel="noopener noreferrer" target="_blank" className="requesting-domain">{props.perms.website}</a>
            <p className="align-left">requested the following permissions: </p>
            <ul>
            {perms.map(perm => {
                return <li key={perm}><Chip type={"new"} perm={perm} destroyPerm={removePerm} /></li>
            })}
            </ul>
            {/* {props.perms.existing && <Existing {...props}/>} */}
            <p>Enter your master password to grant them.</p>
            <input onChange={(e) => setPw(e.currentTarget.value)} type="password" />
            <p className="errorMessage">{error}</p>
            </div>
            <div className="two-buttons">
            <button className="red-bg" onClick={deny} type="submit">Deny</button>
            <button className="blue-button right" onClick={grant} type="submit">Grant</button>
            </div>
        </div>
    )
}

function Existing(props: PermissionsProps){
    return(
        <>
        <p>Following permissions already granted:</p>
        <ul>
        {props.perms.existing.map(perm => <li key={perm}><Chip type={"old"} perm={perm} /> </li>)}
        </ul>
        </>
    )
}
type chipType = "new" | "old"
interface ChipProps{
    perm: Permission,
    destroyPerm?: (perm: Permission) => void,
    type: chipType
}
export function Chip(props: ChipProps){
    function destroy(){
        console.log(props.perm)
        props.destroyPerm(props.perm);
    }
  return(
      <div className="chip">
          <p>{props.perm}
          {props.type == "new" && <span className="close "onClick={destroy}>x</span>}
          </p>
      </div>
  )
}