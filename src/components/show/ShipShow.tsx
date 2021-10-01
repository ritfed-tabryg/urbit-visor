import * as React from "react";
import { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router";
import Sigil from "../ui/svg/Sigil"
import Spinner from "../ui/svg/Spinner";
import { EncryptedShipCredentials } from "../../types/types";
import { loginToShip } from "../../urbit";
import { decrypt } from "../../storage";
import "./show.css";
import { whatShip, processName } from "../../utils"
import { Messaging } from "../../messaging";
import Permissions from "../perms/Permissions";
import { motion } from "framer-motion";
declare const window: any;


interface ShipProps {
  active: EncryptedShipCredentials,
  setActive: (ship: EncryptedShipCredentials) => void,
  saveActive?: (ship: EncryptedShipCredentials, url: string) => void,
  setThemPerms?: (pw: string) => void;
}

export default function ShipShow({ active, setActive, ...props }: ShipProps) {
  const dummyShip: EncryptedShipCredentials = { shipName: "~sampel-palnet", encryptedShipCode: "", encryptedShipURL: "http://localhost" };
  const history = useHistory();
  const [ship, setShip] = useState(dummyShip);
  const [shipURL, setURL] = useState("");
  const [showPerms, setShowPerms] = useState(false);
  const {patp}: any = useParams();

  const [pw, setPw] = useState("");
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false);
  const spinner = <Spinner width="24" height="24" innerColor="white" outerColor="black" />
  const displayName = processName(ship.shipName);
  const shipname = whatShip(ship.shipName) === "moon"
    ? <p className="moonname shipname"><span>~{displayName.slice(0, -14)}</span><span>{displayName.slice(-14)}</span></p>
    : <p className="shipname">~{displayName}</p>
  useEffect(()=>{
    let isMounted = true;
    Messaging.sendToBackground({ action: "cache_form_url", data: { url: "" } });
    Messaging.sendToBackground({ action: "get_ships" })
      .then(res => {
        if (isMounted) {
          setShowPerms(false);
          const s = res.ships.find((ur: EncryptedShipCredentials) => ur.shipName == patp);
          setShip(s);
        }
      });
    return () => { isMounted = false };
  },[patp])


  window.onkeypress = function (e: any) {
    if (e.key == "Enter" && ship.shipName !== active?.shipName) connect();
  }

  async function reconnect(url: string): Promise<void> {
    const code = decrypt(ship.encryptedShipCode, pw);
    setLoading(true);
    loginToShip(url, code)
      .then(res => {
        if (res.statusText == "missing") {
          setError("Could not connect")
          setLoading(false);
        }
        else connect();
      })
      .catch(err => {
        setError("Could not connect")
        setLoading(false);
      })
  }

  async function connect(): Promise<void> {
    setError("");
    if (pw === "") {
      setError("Password can't be empty.")
      return
    }
    const url = decrypt(ship.encryptedShipURL, pw);
    if (url.length) {
      setLoading(true);
      Messaging.sendToBackground({ action: "connect_ship", data: { url: url, ship: ship } })
        .then(res => {
          if (res) setActive(ship);
          else setError("Could not connect");
          setLoading(false);
        })
        .catch(err => {
          if (err.message == 'Failed to PUT channel') reconnect(url)
          else setError("Could not connect")
          setLoading(false);
        })
    } else setError("Wrong password."), setLoading(false);
  }
  function disconnect(): void {
    Messaging.sendToBackground({ action: "disconnect_ship" })
      .then(res => {
        setActive(null);
        history.push("/ship_list");
      });
  }

  const connectButton = <button onClick={connect} className="single-button connect-button">Connect</button>;
  const disconnectButton = <button onClick={disconnect} className="single-button  connect-button red-bg">Disconnect</button>;
  const connectionButton = ship?.shipName == active?.shipName ? disconnectButton : connectButton;

  function gotoHome() {
    setError("");
    const url = decrypt(ship.encryptedShipURL, pw);
    if (url.length) {
      chrome.tabs.create({ url: url })
    } else {
      setError("Wrong password.")
    }
  }
  function gotoPerms() {
    setError("");
    const url = decrypt(ship.encryptedShipURL, pw);
    if (url.length) {
      setURL(url);
      setShowPerms(true);
    } else {
      setError("Wrong password")
    }
  }
  function gotoDashboard() { chrome.tabs.create({ url: "https://urbitdashboard.com" }) }
if (!showPerms) return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="ship-show small-padding flex-grow-wrapper">
          <div className="ship-data">
            <Sigil size={78} patp={ship.shipName} />
            {shipname}
          </div>
          <div className="inputs flex-grow">
            <label>
              Input Your Master Password
              <input onChange={(e) => setPw(e.currentTarget.value)} type="password" placeholder="Master Password" />
            </label>
            <div className="spinner">
              {loading && spinner}
              <p className="errorMessage">{error}</p>
            </div>
            {connectionButton}
          </div>
          <button onClick={gotoPerms} className="single-button cancel-button">Permissions</button>
          <div className="two-buttons second-row">
            <button onClick={gotoDashboard} className="cancel-button">Dashboard</button>
            <button onClick={gotoHome} className="cancel-button right">Home</button>
          </div>
        </motion.div>
  )
  else return <Permissions ship={ship} shipURL={shipURL} />
}