import React, { useState, useEffect } from "react";
import Sigil from "../../components/ui/svg/Sigil"
import { getStorage, validate, decrypt, savePassword, setPopupPreference, removeShip, reset, reEncryptAll } from "../../storage";
import { EncryptedShipCredentials, BackgroundController, PermissionRequest } from "../../types/types";
import "./settings.css";
import {
  MemoryRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory
} from "react-router-dom";
interface SettingsProps{
  ships: EncryptedShipCredentials[]
}
export default function Settings(props: SettingsProps) {
  return (<div className="settings">
    <Link to="/settings/menu"><h1>Settings</h1></Link>
    <hr />
    <Route path="/settings/menu">
      <SettingsMenu />
    </Route>
    <Route path="/settings/popup">
      <SettingsPopup />
    </Route>
    <Route path="/settings/remove_ships">
      <SettingsRemoveShips ships={props.ships} />
    </Route>
    <Route path="/settings/change_password">
      <SettingsChangePw />
    </Route>
    <Route path="/settings/reset_app">
      <SettingsReset />
    </Route>
  </div>)
}

function SettingsMenu() {
  return (
    <>
      <Link to="/settings/popup"><div className="settings-option"><p>Popup Setting</p></div></Link>
      <Link to="/settings/remove_ships"><div className="settings-option"><p>Remove ships</p></div></Link>
      <Link to="/settings/change_password"><div className="settings-option"><p>Change master password</p></div></Link>
      <Link to="/settings/reset_app"><div className="settings-option"><p>Reset app</p></div></Link>
    </>
  )
}

function SettingsPopup(){
  const [error, setError] = useState("");
  const [setting, setSetting] = useState(null);
  const [buttonString, setButton] = useState("Save");
  const [disabled, setDisabled] = useState(false);
  async function readStorage(){
    const res = await getStorage("popup");
    if (res){
      setSetting(res.popup);
      console.log(setting)
    }
  }

  useEffect(()=>{
    readStorage();
  },[])

  function handleChange(e:React.FormEvent<HTMLInputElement>){
    setSetting(e.currentTarget.value);
    setButton("Save");
    setDisabled(false);
  }
  function saveSetting(){
    setPopupPreference(setting)
      .then(res => {
        if (res) {
          setButton("Saved")
          setDisabled(true)
        } else{
          setError("Error")
        }
      })
  }
  return(
    <div className="popup-settings-page">
    <p></p>
    <label> Show Modal in Page
      <input name="popup" type="radio" id="modal" value="modal" checked={setting == "modal"} 
       onChange={handleChange}
      />
    </label>
    <label> Open Popup Window
      <input name="popup" type="radio" id="window" value="window" checked={setting == "window"} 
      onChange={handleChange}
      />
    </label>
    <p className="errorMessage">{error}</p>
    <button className="small-button" disabled={disabled} onClick={saveSetting}>{buttonString}</button>
    </div>
  )
}
function SettingsRemoveShips(props: SettingsProps){
  const [error, setError] = useState("");
  const [ship, setShip] = useState(null);
  const [pw, setPw] = useState("");
  const [deleting, setDeleting] = useState(false);
  function confirm(ship: EncryptedShipCredentials){
    setShip(ship);
    setDeleting(true);
  }
  function remove(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setError("");
    const url = decrypt(ship.encryptedShipURL, pw);
    if (url.length) {
      removeShip(ship)
      .then(res => {
        console.log('do somethin')
      })
    } else {
      setError("Wrong password.")
    }
  }
  return(
    <div className="remove-ships-list">
    {props.ships.map(ship => {
     return (
     <div className="ship-to-remove">
       <Sigil patp={ship.shipName} size={48} />
       <p>~{ship.shipName}</p>
       <button className="small-button red-bg" onClick={() => confirm(ship)}>Delete</button>
      </div>
      )
    })}
    {deleting && 
    <form onSubmit={remove}>
    <label>Input your master password to confirm
      <input onChange={(e) => setPw(e.currentTarget.value)}type="password" />
      </label>
      <p className="errorMessage">{error}</p>
      <button className="small-button" type="submit">Confirm</button> 
      <button onClick={()=> setDeleting(false)} className="small-button" type="submit">Cancel</button> 
      </form>
      }
    </div>
  )
}


function SettingsChangePw() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [oldPassword, setOldpw] = useState("");
  const [pw, setPw] = useState("");
  const [confirmationpw, setConfirmation] = useState("");


  async function checkOld(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setError("");
    const res = await validate(oldPassword);
    if (res) proceed();
    else setError("Wrong old password")
  }

  function proceed() {
    if (pw === confirmationpw) {
      reEncryptAll(oldPassword, pw);
      savePassword(pw)
        .then(res => {
          setMessage("Password changed successfully")
        })
    } else {
      setError("Passwords do not match")
    }
  }
  return (
    <>
      <form onSubmit={checkOld} className="change-password-form">
        <label>Old password
          <input onChange={(e) => setOldpw(e.currentTarget.value)} type="password" />
        </label>
        <label>New password<input onChange={(e) => setPw(e.currentTarget.value)} type="password" /></label>
        <label>Confirm new password<input onChange={(e) => setConfirmation(e.currentTarget.value)} type="password" /></label>
        <p className="errorMessage">{error}</p>
        <p className="successMessage">{message}</p>
        <button className="button" type="submit">Submit</button>
      </form>
    </>
  )
}

function SettingsReset() {
  async function doReset() {
    await reset();
    // history.push("/");
  }
  return (
    <div className="reset-app-setting">
      <p>Click on the button below to reset the extension to factory settings.</p>
      <p>This will delete all ships and your master password.</p>
      <button className="button reset-button red-bg" onClick={doReset}>reset app</button>
    </div>
  )
}