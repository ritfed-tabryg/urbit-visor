import * as React from "react";
import { useState } from "react";
import {initPerms} from "../../urbit";
import {getStorage, decrypt} from "../../storage";
import Spinner from "../ui/svg/Spinner";


interface ConfirmProps{
    url: string,
    code: string,
    ship: string,
    goBack: () => void,
    save: (url: string, code: string, pw: string) => void
}
export default function Confirm(props: ConfirmProps){
  const [loading, setLoading] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const spinner = <Spinner width="24" height="24" innerColor="white" outerColor="black" />

    function addShip(e: React.FormEvent<HTMLFormElement>){
      e.preventDefault();
      getStorage("password")
      .then((res) =>{
         const string = decrypt(res.password, pw);
         if(string === "urbit_visor"){
           saveShip()
         }else{
           setError("Wrong password.")
         }
      })
    }    
    function saveShip(){
      setLoading(true)
      initPerms(props.ship, props.url)
      .then((res) => {
        props.save(props.url, props.code, pw);
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
        setError("Error adding the ship, please try again.")
      })
    };
    return(
      <div className="confirm">
      <p>Connection successful to:</p>
      <p className="confirm-shipname">~{props.ship} </p>
      <p>Please confirm your master password.</p>
      <form onSubmit={addShip} className="form confirm-form">
      <input value={pw} onChange={(e)=> setPw(e.currentTarget.value)} type="password" />
      {loading && spinner}
      <p className="errorMessage">{error}</p>
      <button type="submit" className="small-button loginButton">Submit</button>
      <button className="small-button loginButton red-bg" onClick={props.goBack}>Cancel</button>
      </form>
      </div>
    )
  }