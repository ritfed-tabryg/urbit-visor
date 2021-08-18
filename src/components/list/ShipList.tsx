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
    setFirst: (b: boolean) => void;
}

export default function Dashboard(props: ShipListProps) {
    function doReset(){
        reset();
        props.setFirst(true);
        history.push("/");
      }
    const history = useHistory();
    return (
        <div className="dashboard">
            <p className="ships-connected-msg"> {props.message}</p>
            <p>Your urbits</p>
            <div className="ship-list">
                {props.ships.map((ship) => {
                    return (
                    <Ship active={props.active} key={ship.shipName} ship={ship} select={props.select} />
                    )
                 })}
            </div>
            <button className="button add-more-button" onClick={()=> history.push("/add_ship")}>Add More</button>
            <button className="button reset-button red-bg" onClick={doReset}>reset app</button>
        </div>
    )
}