import * as React from "react";
import { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { validate } from "../../storage";
import "./perms.css";
import { PermissionRequest, Permission } from "../../types/types";
import { Messaging } from "../../messaging";

interface PermissionsPromptProps {
    perms: PermissionRequest
}

export default function PermissionsPrompt(props: PermissionsPromptProps) {
    const history = useHistory();
    const [perms, setPerms] = useState(props.perms);
    const [pw, setPw] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        console.log(perms, 'checking')
        if (!perms.permissions.length) deny();
    }, [perms]);

    function removePerm(perm: Permission) {
        const new_perms = {
            website: perms.website,
            permissions: perms.permissions.filter(p => p != perm),
            existing: perms.existing
        };
        setPerms(new_perms);
    }

    async function grant() {
        const valid = await validate(pw);
        if (valid) {
            setError("");
            Messaging.sendToBackground({ action: "grant_perms", data: { request: perms } })
                .then((res) => {
                    history.push("/");
                    window.close();
                })
                .catch(err => setError("Connection error"))
        }
        else setError("Wrong password");
    }
    function deny() {
        Messaging.sendToBackground({ action: "deny_perms" })
            .then(res => {
                history.push("/");
                window.close();
            });
    }
    return (
        <div className="permissions padding flex-grow-wrapper">
            <h3>Permissions Requested</h3>
            <div className="flex-grow">
                <a href={perms.website} rel="noopener noreferrer" target="_blank" className="requesting-domain">{perms.website}</a>
                <p className="align-left">requested the following permissions: </p>
                <ul>
                    {perms.permissions.map(perm => {
                        return <li key={perm}><Chip type={"new"} perm={perm} destroyPerm={removePerm} /></li>
                    })}
                </ul>
                {/* {perms.existing && <Existing {...props}/>} */}
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
interface ExistingProps {
    perms: PermissionRequest
}
function Existing(props: ExistingProps) {
    return (
        <>
            <p>Following permissions already granted:</p>
            <ul>
                {props.perms?.existing.map(perm => <li key={perm}><Chip type={"old"} perm={perm} /> </li>)}
            </ul>
        </>
    )
}
type chipType = "new" | "old"
interface ChipProps {
    perm: Permission,
    destroyPerm?: (perm: Permission) => void,
    type: chipType
}
export function Chip(props: ChipProps) {
    function destroy() {
        console.log(props.perm, "destroying perm")
        props.destroyPerm(props.perm);
    }
    return (
        <div className="chip">
            <p>{props.perm}
                {props.type == "new" && <span className="close " onClick={destroy}>x</span>}
            </p>
        </div>
    )
}