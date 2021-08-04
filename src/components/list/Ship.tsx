import * as React from "react";
import Sigil from "../ui/svg/Sigil"
import { EncryptedShipCredentials } from "../../types";
import {processName} from "../../utils"

import Spinner from "../ui/svg/Spinner";
import { useHistory, Link } from "react-router-dom";




interface ShipProps{
    ship: EncryptedShipCredentials,
    select: (ship: EncryptedShipCredentials) => void
    remove: (shipName: string) => void
  }
  export default function Ship(props: ShipProps) {
    const history = useHistory();
    const displayName = processName(props.ship.shipName)
    function select():void{
        props.select(props.ship);
        history.push("/ship")
    }
    function connect(){
       console.log('oh hai')
    }

      return (
          <div className="ship">
              <Sigil size={78} patp={props.ship.shipName} />
              <p onClick={select}className="shipname">~{displayName}</p>
              <p onClick={() => props.remove(props.ship.shipName)}>❌</p>
          </div>
      )
  }