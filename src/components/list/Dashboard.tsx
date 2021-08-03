import * as React from "react";
import { useState, useEffect } from "react";
import Sigil from "../ui/svg/Sigil"
import { EncryptedShipCredentials } from "../../types";
import { useHistory } from "react-router-dom";
import "./list.css";

interface DashboardProps {
    ships: EncryptedShipCredentials[]
    remove: (string: string) => void
}

export default function Dashboard(props: DashboardProps) {
    const history = useHistory();
    return (
        <div className="dashboard">
            <p>Your urbits</p>
            <p className="add-more" onClick={()=> history.push("/add_ship")}>Add more</p>
            <div className="ship-list">
                {props.ships.map((ship) => {
                    return (
                    <Ship ship={ship.shipName} onClick={props.remove} />
                    )
                 })}
            </div>
        </div>
    )
}

interface ShipProps{
  ship: string,
  onClick: (shipName: string) => void
}
function Ship(props: ShipProps) {
    return (
        <div className="ship">
            <Sigil size={78} patp={props.ship} />
            <p>~{props.ship}</p>
            <p onClick={() => props.onClick(props.ship)}>❌</p>
        </div>
    )
}