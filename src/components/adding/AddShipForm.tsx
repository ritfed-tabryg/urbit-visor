import * as React from "react";
import { useState } from "react";
import * as CryptoJS from "crypto-js";
import Urbit from "@urbit/http-api";
import { useHistory } from "react-router-dom";
import { EncryptedShipCredentials } from "../../types";
import "./adding.css"
declare const window: any;


async function setAirlock(url: string, code: string): Promise<Urbit> {
  const airlock = new Urbit(url, code);
  const res = await fetch(url + "/~/login");
  const parser = new DOMParser();
  const htmlString = await res.text();
  const doc = parser.parseFromString(htmlString, "text/html");
  // TODO flag this as potentially changing at some point;
  const ship = doc.querySelector('input').value;
  airlock.ship = ship.replace("~", "");
  console.log(JSON.parse(JSON.stringify(airlock)), "airlock set")
  return airlock;
}

async function startChannel(airlock: Urbit): Promise<any> {
  try {
    const validated = await airlock.poke({ app: 'hood', mark: 'helm-hi', json: 'opening airlock' });
    console.log(validated)
    console.log(JSON.parse(JSON.stringify(airlock)), "validating")
    return validated
  } catch (e) {
    console.log(e, "oops")
    console.log(JSON.parse(JSON.stringify(airlock)))
    return "ng";
  }
}



function encrypt(target: string, password: string): string {
  return CryptoJS.AES.encrypt(target, password).toString();
}

export default function AddShipForm() {
  const history = useHistory();
  const [error, setError] = useState("");
  const [url, setUrl] = useState("https://m.urbit.cloud")
  const [code, setCode] = useState("wintun-ridrut-hosdeg-motsyl")
  const [pw, setPw] = useState("xd")

  async function postLogin(url: string, code: string): Promise<void> {
    const res = await fetch(url + "/~/login", {
      body: `password=${code}`,
      method: "POST",
      credentials: "include",
      redirect: "follow"
    });
    switch (res.status) {
      case 204:
        const urbit = await setAirlock(url, code);
        startChannel(urbit);
        saveCredentials(urbit.ship, url, code, pw);
        break;
      case 400:
        setError("Wrong password");
        break;
      default:
        setError("Wrong URL");
        break;
    };
  }

  function saveCredentials(ship: string, url: string, code: string, pw: string): void {
    const encryptedURL = encrypt(url, pw).toString();
    const encryptedCode = encrypt(code, pw).toString();
    const encryptedCredentials: EncryptedShipCredentials = {
      shipName: ship,
      encryptedShipURL: encryptedURL,
      encryptedShipCode: encryptedCode,
    }
    storeCredentials(encryptedCredentials);
  }
  
  function storeCredentials(encryptedCredentials: EncryptedShipCredentials): void {
    chrome.storage.local.get("ships", (res) => {
      if (res["ships"]) {
        let new_ships = res["ships"];
        new_ships.push(encryptedCredentials)
        chrome.storage.local.set({ ships: new_ships });
      } else {
        let new_ships = [encryptedCredentials];
        chrome.storage.local.set({ ships: new_ships });
      }
      history.push("/");
    });
  }

  const onChangeURL = (e: React.FormEvent<HTMLInputElement>) => setUrl(e.currentTarget.value)
  const onChangeCode = (e: React.FormEvent<HTMLInputElement>) => setCode(e.currentTarget.value)
  const onChangePassword = (e: React.FormEvent<HTMLInputElement>) => setPw(e.currentTarget.value)
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    await postLogin(url, code);
  }




  return (
    <form onSubmit={onSubmit}>
      <div>
        <input
          type="text"
          name='shipURL'
          id='loginFormShipURL'
          className='loginFormInput'
          value={url}
          // placeholder='Ship URL'
          onChange={onChangeURL}
          required
        />
        <input
          type="password"
          name='shipCode'
          id='loginFormShipCode'
          className='loginFormInput'
          value={code}
          // placeholder='Ship +code'
          onChange={onChangeCode}
          required
        />
        <input
          name='encryptionPassword'
          id='loginFormEncryptionPassword'
          className='loginFormInput'
          value={pw}
          // placeholder='Ship Password'
          onChange={onChangePassword}
          type='password'
          required
        />
        <div className="buttonContainer">
          <button className="loginButton" type='submit'>
            Add Ship
          </button>
        </div>
        <div className="errorMessage">
          <p>{error}</p>
        </div>
      </div>
    </form>
  )
}