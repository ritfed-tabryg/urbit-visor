import * as React from "react";
import {useState, useEffect} from "react";
import Ship from "./Ship"
import { useHistory } from "react-router-dom";
import { EncryptedShipCredentials } from "../../types/types";
import "./list.css";
import {useStore} from "../../store";
import { Messaging } from "../../messaging";

interface ShipListProps{
    active: EncryptedShipCredentials
}
export default function ShipList({active}: ShipListProps) {
    useEffect(()=>{
      Messaging.sendToBackground({action: "get_ships"}).then(res => setShips(res.ships));
    }, [])
    const history = useHistory();
    const [ships, setShips] = useState([]);

    const inactive = ships.filter(s => s.shipName != active?.shipName);

    const message = active ? "" : "No ship connected";
    let ordered = [];
    ordered = active ? [active, ...inactive] : inactive;
    const display = ordered.length
    ? ordered.map((ship) => {
        return (
        <Ship active={active} key={ship.shipName} ship={ship}/>
        )
     })
    : <p>Please add a ship</p>

    return (
        <div className="dashboard flex-grow-wrapper">
            <h1>Your Ships</h1>
            <div className="ship-list flex-grow">
                {display}
            </div>
            <p className="ships-connected-msg"> {message}</p>
            <div className="padding flex-end">
            <button className="single-button add-more-button" onClick={()=> history.push("/add_ship")}>Add Ship</button>
            </div>
        </div>
    )
}