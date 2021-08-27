import * as React from "react";
import { useState } from "react";
import Sigil from "../ui/svg/Sigil"
import { useHistory } from "react-router-dom";
import Spinner from "../ui/svg/Spinner";
import Urbit from "@urbit/http-api";
import * as CryptoJS from "crypto-js";
import { EncryptedShipCredentials } from "../../types/types";
import { loginToShip, fetchAllPerms } from "../../urbit";
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
        // TODO this approach was suspiciously smooth. Keep this flag in case it breaks.
        connect();
      })
  }


  async function connect(): Promise<void> {
    setError("");
    if (pw === "") {
      setError("Password can't be empty.")
      return
    }
    const url = CryptoJS.AES.decrypt(props.ship.encryptedShipURL, pw).toString(CryptoJS.enc.Utf8);
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
  async function testScry() {
    setError("");
    const url = CryptoJS.AES.decrypt(props.ship.encryptedShipURL, pw).toString(CryptoJS.enc.Utf8);
    if (url.length) {
      setLoading(true);
      const airlock = new Urbit(url, "");
      const res = await airlock.scry({ app: "graph-store", path: "/keys" });
      console.log(res);
      setLoading(false);
    } else {
      setError("wrong password")
    }

  }
  async function testPoke() {
    setError("");
    const url = CryptoJS.AES.decrypt(props.ship.encryptedShipURL, pw).toString(CryptoJS.enc.Utf8);
    if (url.length) {
      setLoading(true);
      const airlock = new Urbit(url, "");
      console.log(airlock)
      airlock.ship = props.ship.shipName;
      airlock.verbose = true;
      const poke = await airlock.poke({ app: 'hood', mark: 'helm-hi', json: 'opening airlock' })
      console.log(poke);
      setLoading(false);
    } else {
      setError("wrong password")
    }

  }
  async function testSubscribe() {
    setError("");
    console.log('subscribing')
    const url = CryptoJS.AES.decrypt(props.ship.encryptedShipURL, pw).toString(CryptoJS.enc.Utf8);
    if (url.length) {
      setLoading(true);
      const airlock = new Urbit(url, "");
      console.log(airlock)
      airlock.ship = props.ship.shipName;
      airlock.verbose = true;
      const res = await airlock.subscribe({ app: "graph-store", path: "/updates" });
      console.log(res);
      setLoading(false);
    } else {
      setError("Wrong password.")
    }
  }
  async function testPerms() {
    setError("");
    const url = CryptoJS.AES.decrypt(props.ship.encryptedShipURL, pw).toString(CryptoJS.enc.Utf8);
    if (url.length) {
      setLoading(true);
      const res = await fetchAllPerms(url)
      console.log(res);
      setLoading(false);
    } else{
      setError("Wrong password.")
    }
  }

  const connectButton = <div onClick={connect} className="button">Connect</div>;
  const disconnectButton = <div onClick={disconnect} className="button red-bg">disconnect</div>
  const connectionButton = props.ship?.shipName == props.active?.shipName ? disconnectButton : connectButton
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

  return (
    <div className="ship-show">
      <div className="ship-data">
        <Sigil size={78} patp={props.ship.shipName} />
        {shipname}
      </div>
      <div className="buttons">
        <label>
          Input your master password.
        <input onChange={(e) => setPw(e.currentTarget.value)} type="password" placeholder="password" />
        </label>
        {/* <button onClick={testScry}>Test Scry</button>
        <button onClick={testPoke}>Test Poke</button>
        <button onClick={testSubscribe}>Test Subscribe</button>
        <button onClick={testPerms}>Test Permissions</button> */}
        <div className="spinner">
          {loading && spinner}
          <p className="errorMessage">{error}</p>
        </div>
      </div>
      {connectionButton}
      <button onClick={gotoLandscape} className="button">Landscape</button>
      <button onClick={gotoPerms} className="button">Perms</button>
    </div>
  )
}