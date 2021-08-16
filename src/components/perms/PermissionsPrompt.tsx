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
    const history = useHistory();
    const [pw, setPw] = useState("");
    const [error, setError] = useState("");

    async function grant() {
        const valid = await validate(pw);
        if (valid) {
            setError("");
            props.savePerms(pw, props.perms);
            chrome.runtime.sendMessage({ type: "dismissPerms" });
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
            <p>{props.perms.permissions}</p>
            <p>Enter your password to grant them</p>
            <input onChange={(e) => setPw(e.currentTarget.value)} type="password" />
            <button onClick={grant} type="submit">Grant</button>
            <button className="red-bg" onClick={deny} type="submit">Deny</button>
            <p className="errorMessage">{error}</p>
        </div>
    )
}