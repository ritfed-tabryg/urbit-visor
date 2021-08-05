import * as React from "react";
import {EncryptedShipCredentials} from "../types/types";


function ShipListElement(props: {shipCredentials: EncryptedShipCredentials}) {
  return (
  <div className="shipListElement">
      <span>{props.shipCredentials.shipName}</span>
  </div>
  );
}

class ShipList extends React.Component< {}, {shipCredentials: EncryptedShipCredentials[]} > {
    componentWillMount() {
      this.setState({
        shipCredentials: [{
          shipName: '',
          encryptedShipURL: '',
          encryptedShipCode: '',
      }]});

      chrome.storage.local.get("ships", (res) => {
          if (res["ships"]) {
              this.setState({shipCredentials: res["ships"]});
          }
      });
    }

  render() {
    console.log(this.state)
    return (
      <div className="shipList">
        {this.state.shipCredentials.map(s => <ShipListElement key={s.shipName} shipCredentials={s} />)}
      </div>
    )
  }
}

export default ShipList;