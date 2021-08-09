import * as React from "react";
import { useState } from "react";
import Form from "./Form";
import Confirm from "./Confirm"
import Urbit from "@urbit/http-api";
import {storeCredentials} from "../../storage";
import {useHistory} from "react-router";


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

export default function AddShip(){
    async function save(url: string, code: string, pw: string) : Promise<any>{
        const airlock = await setAirlock(url, code);
        const set = await storeCredentials(airlock.ship, url, code, pw);
        if (set == true) history.push("/");
    }
    const history = useHistory();
    const [url, setUrl] = useState("http://localhost");
    const [code, setCode] = useState("micmev-rapteb-fopsur-monsug");
    const [confirm, setConfirm] = useState(false);
    const component = 
    confirm 
    ? <Confirm 
         url={url}
         code={code}
         save={save}
         goBack={()=> setConfirm(false)}
       /> 
    : <Form 
         url={url} 
         setUrl={setUrl}
         code={code}
         setCode={setCode}
         setConfirm={setConfirm}
       />
    return(
        <>
        {component}
        </>
    )  
}