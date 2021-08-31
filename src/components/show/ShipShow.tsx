import * as React from "react";
import { useState } from "react";
import Sigil from "../ui/svg/Sigil"
import { useHistory } from "react-router-dom";
import Spinner from "../ui/svg/Spinner";
import Urbit from "@urbit/http-api";
import * as CryptoJS from "crypto-js";
import { EncryptedShipCredentials } from "../../types/types";
import { loginToShip, fetchAllPerms } from "../../urbit";
import { getStorage, validate, decrypt, savePassword, setPopupPreference, removeShip, reset, reEncryptAll } from "../../storage";
import "./show.css";
import { whatShip, processName } from "../../utils"
declare const window: any;


interface ShipProps {
  ship: EncryptedShipCredentials,
  active: EncryptedShipCredentials,
  save: (ship: EncryptedShipCredentials, url: string) => void,
  setThemPerms: (pw: string) => void;
}

export default function Ship(props: ShipProps) {
  const history = useHistory();
  const [pw, setPw] = useState("");
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false);
  const spinner = <Spinner width="24" height="24" innerColor="white" outerColor="black" />
  const displayName = processName(props.ship.shipName);
  const shipname = whatShip(props.ship.shipName) === "moon"
    ? <p className="moonname shipname"><span>~{displayName.slice(0, -14)}</span><span>{displayName.slice(-14)}</span></p>
    : <p className="shipname">~{displayName}</p>


  window.onkeypress = function (e: any) {
    if (e.key == "Enter" && props.ship?.shipName !== props.active?.shipName) connect();
  }

  async function reconnect(url: string): Promise<void> {
    const code = CryptoJS.AES.decrypt(props.ship.encryptedShipCode, pw).toString(CryptoJS.enc.Utf8);
    setLoading(true);
    loginToShip(url, code)
      .then(res => {
        console.log(res, "reconnect successful")
        // TODO this approach was suspiciously smooth. Keep this flag in case it breaks.
        // might need more handlers for different errors
        if (res.statusText == "missing"){
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
    const url = decrypt(props.ship.encryptedShipURL, pw);
    console.log(url, "url")
    if (url.length) {
      setLoading(true);
      const airlock = new Urbit(url, "");
      airlock.ship = props.ship.shipName;
      airlock.verbose = true;
      airlock.poke({ app: 'hood', mark: 'helm-hi', json: 'opening airlock' })
        .then(res => {
          setLoading(false);
          props.save(props.ship, url);
        })
        .catch(err => {
          if (err.message == 'Failed to PUT channel') reconnect(url)
          else {
            setError("Could not connect")
            setLoading(false);
          }
        })
      // const time = new Promise((res) => setTimeout(() => res("p1"), 5000));
      // Promise.race([time, poke])
      // .then(value => {
      //   console.log(value, "promise race")
      // })
    } else {
      setError("Wrong password.")
    }
  }
  async function disconnect(): Promise<void> {
    props.save(null, null)
  }

  const connectButton = <button onClick={connect} className="single-button connect-button">Connect</button>;
  const disconnectButton = <button onClick={disconnect} className="single-button  connect-button red-bg">Disconnect</button>;
  const connectionButton = props.ship?.shipName == props.active?.shipName ? disconnectButton : connectButton;

  function gotoLandscape() {
    setError("");
    const url = CryptoJS.AES.decrypt(props.ship.encryptedShipURL, pw).toString(CryptoJS.enc.Utf8);
    if (url.length) {
      chrome.tabs.create({url: url})
    } else{
      setError("Wrong password.")
    }
  }
  function gotoPerms() {
    setError("");
    const url = CryptoJS.AES.decrypt(props.ship.encryptedShipURL, pw).toString(CryptoJS.enc.Utf8);
    if (url.length) {
      props.setThemPerms(url);
    } else{
      setError("Wrong password.")
    }
  }
  function gotoDashboard() {chrome.tabs.create({url: "https://dashboard.urbitvisor.com"})}
  function gotoUrbitLive() {chrome.tabs.create({url: `https://urbit.live/${props.ship.shipName}`})}

  return (
    <div className="ship-show small-padding flex-grow-wrapper">
      <div className="ship-data">
        <Sigil size={78} patp={props.ship.shipName} />
        {shipname}
      </div>
      <div className="inputs flex-grow">
        <label>
          Input your master password.
        <input onChange={(e) => setPw(e.currentTarget.value)} type="password" placeholder="password" />
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
      <button onClick={gotoLandscape} className="cancel-button right">Landscape</button>
      </div>
    </div>
  )
}