import * as React from "react";
import { useState } from "react";
import Spinner from "../ui/svg/Spinner";
import { fetchShipname } from "../../urbit";
import { Messaging } from "../../messaging";
import "./adding.css";
import { motion } from "framer-motion";


interface AddShipFormProps {
  url: string,
  code: string,
  setUrl: (v: string) => void,
  setCode: (v: string) => void,
  setShipName: (shipName: string) => void,
}

export default function AddShipForm({ url, code, setUrl, setCode, setShipName }: AddShipFormProps) {
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
            Messaging.sendToBackground({ action: "cache_form_url", data: { url: "" } });
            setLoading(false);
            fetchShipname(url)
              .then(shipName => setShipName(shipName))
              .catch(err => setError("Your ship needs an OS update"))
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
    Messaging.sendToBackground({ action: "cache_form_url", data: { url: e.currentTarget.value } });
  }
  const onChangeCode = (e: React.FormEvent<HTMLInputElement>) => setCode(e.currentTarget.value)
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("")
    setLoading(true);
    postLogin(url, code);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="full-size"
    >
      <form className="form padding flex-grow-wrapper" onSubmit={onSubmit}>
        <p className="form-prompt">Input Your Urbit Ship Credentials</p>
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
    </motion.div>
  )
}