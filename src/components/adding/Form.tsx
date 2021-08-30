import * as React from "react";
import { useState, useEffect } from "react";
import Spinner from "../ui/svg/Spinner";
import { useHistory } from "react-router-dom";
import { EncryptedShipCredentials } from "../../types/types";
import "./adding.css"
declare const window: any;




// async function startChannel(airlock: Urbit): Promise<any> {
//   try {
//     const validated = await airlock.poke({ app: 'hood', mark: 'helm-hi', json: 'opening airlock' });
//     console.log(validated)
//     console.log(JSON.parse(JSON.stringify(airlock)), "validating")
//     return validated
//   } catch (e) {
//     console.log(e, "oops")
//     console.log(JSON.parse(JSON.stringify(airlock)))
//     return "ng";
//   }
// }



interface AddShipFormProps {
  url: string,
  code: string,
  setUrl: (v: string) => void,
  setCode: (v: string) => void,
  getShipname: (url: string, code: string) => void,
  setConfirm: (v: boolean) => void,
}

export default function AddShipForm({ url, code, setUrl, setCode, getShipname, setConfirm }: AddShipFormProps) {
  useEffect(()=> {
    chrome.runtime.sendMessage({type: "adding"}, (res)=> setUrl(res))
  }, []);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  async function postLogin(url: string, code: string): Promise<void> {
    const controller = new AbortController()
    setTimeout(() => { controller.abort() }, 5000)
    fetch(url.replace(/\/$/g, '') + "/~/login", {
      body: `password=${code}`,
      method: "POST",
      credentials: "include",
      redirect: "follow",
      signal: controller.signal
    })
      .then(async res => {
        switch (res.status) {
          case 204:
            chrome.runtime.sendMessage({type: "done adding"})
            setLoading(false);
            getShipname(url, code);
            setConfirm(true);
            break;
          case 400:
            setError("Invalid +code.\nCould not connect to ship.");
            setLoading(false);
            break;
          default:
            setError("Invalid URL.\nCould not connect to ship.");
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


  const spinner = <Spinner width="24" height="24" innerColor="white" outerColor="black" />


  const onChangeURL = (e: React.FormEvent<HTMLInputElement>) => {
    setUrl(e.currentTarget.value);
    chrome.runtime.sendMessage({type: "please_cache", url: e.currentTarget.value});
  }
  const onChangeCode = (e: React.FormEvent<HTMLInputElement>) => setCode(e.currentTarget.value)
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("")
    setLoading(true);
    postLogin(url, code);
  }

  return (
      <form className="form login-form flex-grow-wrapper" onSubmit={onSubmit}>
        <p className="form-prompt">Input the credentials for your Urbit ship</p>
        <div className="inputs flex-grow">
        <label htmlFor="shipURL">
          URL
          <input
            type="text"
            name='shipURL'
            id='loginFormShipURL'
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
            value={code}
            placeholder='sampel-sampel-sampel-sampel'
            onChange={onChangeCode}
            maxLength={27}
            required
          />
        </label>
        </div>
        <div className="errorMessage">
        {loading && <div className="spinner">{spinner}</div>}
          {error.split("\n").map((p) => <p key={p}>{p}</p>)}
        </div>
          <button disabled={code.length < 27} className="single-button" type='submit'>
            Add Ship
          </button>
      </form>
  )
}