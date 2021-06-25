import * as React from "react";
import {EncryptedShipCredentials} from "../types";


function ShipListElement(props: { shipName: string }) {
  return (
  <div className="shipListElement">
      <span>{props.shipName}</span>
  </div>
  );
}

class ShipList extends React.Component< {}, EncryptedShipCredentials[] > {
    componentWillMount() {
      this.setState([{
          shipName: '',
          encryptedShipURL: '',
          encryptedShipCode: '',
      }]);
      chrome.storage.local.get("ships", (res) => {
          if (res["ships"]) {
              this.setState(res["ships"])
          }
      });
    }

  render() {
    return (
      <div className="shipList">
        <div>{this.state.values}</div>
        <div>{this.state.entries}</div>
        <div>{this.state.keys}</div>
        <div>{this.state.toString}</div>
        {/* {this.state.map(s => <ShipListElement key={s.shipName} shipName={s.shipName} />)} */}
      </div>
    )
  }
}


export default ShipList;