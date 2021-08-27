import * as React from "react";
import { useState } from "react";
import { useHistory } from "react-router";
import { AES } from "crypto-js";
import { validate } from "../../storage";
import "./perms.css";
import { PermissionRequest } from "../../types/types"


interface PermissionsProps {
    perms: PermissionRequest
    savePerms: (pw: string, perms: PermissionRequest) => void
}
export default function PermissionsPrompt(props: PermissionsProps) {
    console.log(props.perms, "perms")
    const history = useHistory();
    const [pw, setPw] = useState("");
    const [error, setError] = useState("");
    

    async function grant() {
        const valid = await validate(pw);
        if (valid) {
            setError("");
            props.savePerms(pw, props.perms);
            chrome.runtime.sendMessage({ type: "dismissPerms" });
            chrome.browserAction.setBadgeText({text: ""});
            history.push("/");
        }
        else setError("Wrong password");
    }
    async function deny() {
        chrome.runtime.sendMessage({ type: "dismissPerms" });
        history.push("/")
    }
    return (
        <div className="permissions">
            <p>{props.perms.website} is requesting the following permissions: </p>
            {props.perms.permissions.map(perm => {
                return <p key={perm}>{perm}</p>
            })}
            {props.perms.existing && <Existing {...props}/>}
            <p>Enter your master password to grant them.</p>
            <input onChange={(e) => setPw(e.currentTarget.value)} type="password" />
            <button onClick={grant} type="submit">Grant</button>
            <button className="red-bg" onClick={deny} type="submit">Deny</button>
            <p className="errorMessage">{error}</p>
        </div>
    )
}

function Existing(props: PermissionsProps){
    return(
        <>
        <p>Following permissions already granted:</p>
        {props.perms.existing.map(perm => <p key={perm}>{perm}</p>)}
        </>
    )
}