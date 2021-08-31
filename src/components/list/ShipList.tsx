import * as React from "react";
import { useState, useEffect } from "react";
import Ship from "./Ship"
import { EncryptedShipCredentials } from "../../types/types";
import { useHistory } from "react-router-dom";
import "./list.css";
import {reset} from "../../storage";


interface ShipListProps {
    active: EncryptedShipCredentials
    ships: EncryptedShipCredentials[]
    select:  (ship: EncryptedShipCredentials) => void
    message: string
}

export default function Dashboard(props: ShipListProps) {
    async function doReset(){
        await reset();
        history.push("/");
      }
    const history = useHistory();
    const inactive = props.ships.filter(s => s.shipName != props.active?.shipName);
    let ordered = [];
    ordered = props.active ? [props.active, ...inactive] : inactive;
    const display = ordered.length
    ? ordered.map((ship) => {
        return (
        <Ship active={props.active} key={ship.shipName} ship={ship} select={props.select} />
        )
     })
    : <p>Please add a ship</p>

    return (
        <div className="dashboard flex-grow-wrapper">
            <div className="ship-list-title"><h1>Your Ships</h1></div>
            {/* <p className="ships-connected-msg"> {props.message}</p> */}
            <div className="ship-list flex-grow">
                {display}
            </div>
            <div className="padding">
            <button className="single-button add-more-button" onClick={()=> history.push("/add_ship")}>Add Ship</button>
            </div>
        </div>
    )
}