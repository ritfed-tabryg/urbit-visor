import React, { useState, useEffect } from "react";
import Sigil from "../ui/svg/Sigil";
import { useHistory } from "react-router-dom";
import { EncryptedShipCredentials } from "../../types/types";
import { decrypt, removeShip, } from "../../storage";
import { Messaging } from "../../messaging";



interface ConfirmRemoveProps {
    ship: EncryptedShipCredentials
}

export default function ConfirmRemove({ ship }: ConfirmRemoveProps) {
    const history = useHistory();
    const [error, setError] = useState("");
    const [pw, setPw] = useState("");
    function remove(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        const url = decrypt(ship.encryptedShipURL, pw);
        if (url.length) {
            Messaging.sendToBackground({action: "remove_ship", data: {ship: ship}})
                .then(res => {
                    history.push("/ship_list");
                })
        } else {
            setError("Wrong password")
        }
    }
    return (
        <div className="ship-removal-confirmation padding flex-grow-wrapper">
            <h3 className="no-margin">Confirm removal</h3>
            <div className="sigil-wrap">
              <Sigil size={120} patp={ship.shipName} />
            </div>
            <div className="text">
                <p className="ship-to-delete">~{ship.shipName}</p> 
                <p>The above ship will be removed from Urbit Visor.</p>
            </div>
            <form className="flex-grow-wrapper" onSubmit={remove}>
                <div className="password-input flex-grow">
                    <label>Input your master password
                        <input onChange={(e) => setPw(e.currentTarget.value)} type="password" />
                    </label>
                    <p className="errorMessage">{error}</p>
                </div>
                <div className="two-buttons">
                    <button className="cancel-button" type="button" onClick={() => history.push("/settings/remove_ships")}>Cancel</button>
                    <button className="red-bg right" type="submit">Remove</button>
                </div>
            </form>
        </div>
    )
}

// {deleting && 
//     <form onSubmit={remove}>
//     <label>Input your master password to confirm
//       <input onChange={(e) => setPw(e.currentTarget.value)}type="password" />
//       </label>
//       <p className="errorMessage">{error}</p>
//       <button className="small-button" type="submit">Confirm</button> 
//       <button onClick={()=> setDeleting(false)} className="small-button" type="submit">Cancel</button> 
//       </form>
//       }