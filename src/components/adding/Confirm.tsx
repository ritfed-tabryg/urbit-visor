import * as React from "react";
import { useState } from "react";
import {getStorage, storeCredentials, decrypt} from "../../storage";

interface ConfirmProps{
    url: string,
    code: string,
    goBack: () => void,
    save: (url: string, code: string, pw: string) => void
}
export default function Confirm(props: ConfirmProps){
    function validate(){
      getStorage("password")
      .then((res) =>{
         const string = decrypt(res.password, pw);
         if(string === "lwu"){
           setError("");
           props.save(props.url, props.code, pw);
         }else{
           setError("invalid password")
         }
      })
    }
    const [pw, setPw] = useState("")
    const [error, setError] = useState("")
    return(
      <>
      <a onClick={props.goBack}>back</a>
      <p>Connection successful.</p>
      <p>Please confirm your Encryption Password.</p>
      <div className="form">
      <input value={pw} onChange={(e)=> setPw(e.currentTarget.value)} type="password" />
      <button onClick={validate}>Submit</button>
      <p className="errorMessage">{error}</p>
      </div>
      </>
    )
  }