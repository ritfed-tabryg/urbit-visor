import * as React from "react";
import { useState } from "react";
import {initPerms} from "../../urbit";
import {getStorage, decrypt} from "../../storage";

interface ConfirmProps{
    url: string,
    code: string,
    ship: string,
    goBack: () => void,
    save: (url: string, code: string, pw: string) => void
}
export default function Confirm(props: ConfirmProps){
    function validate(){
      getStorage("password")
      .then((res) =>{
         const string = decrypt(res.password, pw);
         if(string === "lwu"){
           saveShip()
         }else{
           setError("invalid password")
         }
      })
    }    
    function saveShip(){
      // setError("initiating permission system");
      initPerms(props.ship, props.url)
      .then((res) => {
        console.log(res, "saving")
        props.save(props.url, props.code, pw);
      })
      .catch((err) => setError("oops"))
    };
    const [pw, setPw] = useState("")
    const [error, setError] = useState("")
    return(
      <>
      <div className="back-button">
      <a onClick={props.goBack}>←</a>
      </div>
      <p>Connection to ~{props.ship} successful.</p>
      <p>Please confirm your Encryption Password.</p>
      <div className="form">
      <input value={pw} onChange={(e)=> setPw(e.currentTarget.value)} type="password" />
      <button onClick={validate}>Submit</button>
      <p className="errorMessage">{error}</p>
      </div>
      </>
    )
  }