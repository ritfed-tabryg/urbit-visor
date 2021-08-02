import * as React from "react";
import {useState} from "react";
import * as CryptoJS  from "crypto-js";
import Urbit from "@urbit/http-api";
import "./adding.css"
declare const window: any;

async function customAirlock(url: string, code: string): Promise<string>{
    const opts = {
        body: `password=${code}`,
        method: "POST",
    }
    const res = await fetch("http://" + url + "/~/login", opts);
    console.log(res, "customairlock")
    console.log(res.headers)
    console.log(document.cookie)
    return "ok"
}

async function validateLogin(url: string, code: string): Promise<string>{
    const args = {
        url: url,
        code: code,
        ship: "",
        verbose: true
    };
    const a = customAirlock(url, code);
    const u = await Urbit.authenticate(args)
    console.log(u, "urbit")
    window.airlock = u;

    return "ok"
}

function saveCredentials(ship: string, url: string, code: string): void{
  console.log('saving credentials')
}

function encrypt(target:string, password:string): string {
   return CryptoJS.AES.encrypt(target, password).toString();
}

export default function AddShipForm(){
  const [error, setError] = useState("");
  const [url, setUrl] = useState("http://localhost:8080")
  const [code, setCode] = useState("sampel-sampel-sampel-sampel")
  const [pw, setPw] = useState("")
  const onChangeURL = (e: React.FormEvent<HTMLInputElement>) => setUrl(e.currentTarget.value)
  const onChangeCode = (e: React.FormEvent<HTMLInputElement>) => setCode(e.currentTarget.value)
  const onChangePassword = (e: React.FormEvent<HTMLInputElement>) => setPw(e.currentTarget.value)
  const onSubmit =  async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
     const ship = await validateLogin(url, code);
    //  if (ship != "nope"){
    //    saveCredentials(ship, url, code)
    //  } else{
    //      setError("oops")
    //  }
    setError("oops")
  }
  return(
     <form onSubmit={onSubmit}>
            <div>
                <input
                    type="text"
                    name='shipURL'
                    id='loginFormShipURL'
                    className='loginFormInput'
                    placeholder='Ship URL'
                    onChange={onChangeURL}
                    required
                    />
                <input
                    type="password"
                    name='shipCode'
                    id='loginFormShipCode'
                    className='loginFormInput'
                    placeholder='Ship +code'
                    onChange={onChangeCode}
                    required
                    />
                <input
                    name='encryptionPassword'
                    id='loginFormEncryptionPassword'
                    className='loginFormInput'
                    placeholder='Ship Password'
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