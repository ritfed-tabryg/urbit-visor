import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { EncryptedShipCredentials } from "../../types/types";
import { decrypt, removeShip, } from "../../storage";


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
            removeShip(ship)
                .then(res => {
                    console.log('ok')
                })
        } else {
            setError("Wrong password")
        }
    }
    return (
        <div className="ship-removal-confirmation">
            <div className="ship">
                <p>{ship.shipName}</p>
            </div>
            <div className="text">
                <p>Confirm below to remove the ship from your Urbit Visor</p>
                <p>You can always add the ship again any time.</p>
            </div>
            <form onSubmit={remove}>
                <div className="password-input">
                    <label>Input your master password
                        <input onChange={(e) => setPw(e.currentTarget.value)} type="password" />
                    </label>
                    <p className="errorMessage">{error}</p>
                </div>
                <div className="buttons">
                    <button type="button" onClick={() => history.push("/settings/remove_ships")}>Cancel</button>
                    <button type="submit">Remove</button>
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