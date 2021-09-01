import * as React from "react";
import Sigil from "../ui/svg/Sigil"
import { EncryptedShipCredentials } from "../../types/types";
import {whatShip, processName} from "../../utils"

import Spinner from "../ui/svg/Spinner";
import { useHistory, Link } from "react-router-dom";




interface ShipProps{
    active: EncryptedShipCredentials
    ship: EncryptedShipCredentials,
    select: (ship: EncryptedShipCredentials) => void
  }
  export default function Ship(props: ShipProps) {
    const history = useHistory();
    const displayName = processName(props.ship.shipName);
    const shipname = whatShip(props.ship.shipName) === "moon"
    ? <p onClick={select} className="moonname shipname"><span>~{displayName.slice(0, -14)}</span><span>{displayName.slice(-14)}</span></p>
    : <p onClick={select} className="shipname">~{displayName}</p>


    function select():void{
        props.select(props.ship);
        history.push("/ship")
    };
    
      return (
          <div onClick={select} className="ship">
              <div className={props.active?.shipName == props.ship.shipName ? "sigil-wrapper active-ship" : "sigil-wrapper"}>
              <Sigil size={props.active?.shipName == props.ship.shipName ? 64 :70} patp={props.ship.shipName} />
              </div>
              {shipname}
          </div>
      )
  }