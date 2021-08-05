import * as React from "react";
import { useState } from "react";
import * as CryptoJS from "crypto-js";
import Urbit from "@urbit/http-api";
import Spinner from "../ui/svg/Spinner";
import { useHistory } from "react-router-dom";
import { EncryptedShipCredentials } from "../../types/types";
import {storeCredentials} from "../../storage";
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

interface AddShipFormProps{
  store: (encryptedCredentials: EncryptedShipCredentials) => void
}

export default function AddShipForm(props: AddShipFormProps) {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState(null)
  const [code, setCode] = useState(null)
  const [pw, setPw] = useState(null)

  async function postLogin(url: string, code: string): Promise<void> {
    const controller = new AbortController() 
    setTimeout(() => {controller.abort()}, 5000)
    fetch(url.replace(/\/$/g, '') + "/~/login", {
      body: `password=${code}`,
      method: "POST",
      credentials: "include",
      redirect: "follow",
      signal: controller.signal
    })
    .then(async res =>{
      switch (res.status) {
        case 204:
          const urbit = await setAirlock(url, code);
          startChannel(urbit);
          saveCredentials(urbit.ship, url, code, pw);
          setLoading(false);
          break;
        case 400:
          setError("Invalid +code. Could not connect to ship.");
          setLoading(false);
          break;
        default:
          setError("Invalid URL. Could not connect to ship.");
          setLoading(false);
          break;
      };
    })
    .catch(err => {
      console.log(err, "err")
      setError("Could not connect")
      setLoading(false);
    })
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
    history.push("/")
  }

  const spinner =  <Spinner width="24" height="24" innerColor="white" outerColor="black" />


  const onChangeURL = (e: React.FormEvent<HTMLInputElement>) => setUrl(e.currentTarget.value)
  const onChangeCode = (e: React.FormEvent<HTMLInputElement>) => setCode(e.currentTarget.value)
  const onChangePassword = (e: React.FormEvent<HTMLInputElement>) => setPw(e.currentTarget.value)
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("")
    setLoading(true);
    postLogin(url, code);
  }




  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="shipURL">
          URL
        <input
          type="text"
          name='shipURL'
          id='loginFormShipURL'
          className='loginFormInput'
          value={url}
          placeholder='http://localhost'
          onChange={onChangeURL}
          required
        />
        </label>
        <label htmlFor="shipCode">
          +code
        <input
          type="password"
          name='shipCode'
          id='loginFormShipCode'
          className='loginFormInput'
          value={code}
          placeholder='sampel-sampel-sampel-sampel'
          onChange={onChangeCode}
          required
        />
        </label>
        <label htmlFor="encryptionPassword">
          Password
        <input
          name='encryptionPassword'
          id='loginFormEncryptionPassword'
          className='loginFormInput'
          value={pw}
          placeholder='Ship Password'
          onChange={onChangePassword}
          type='password'
          required
        />
        </label>
        <div className="buttonContainer">
          <button className="loginButton" type='submit'>
            Add Ship
          </button>
        </div>
        {loading && spinner}
        <div className="errorMessage">
          <p>{error}</p>
        </div>
      </div>
    </form>
  )
}